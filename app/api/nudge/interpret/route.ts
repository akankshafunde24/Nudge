import { NextResponse } from "next/server";
import { parseNudgeText } from "@/lib/core/nudge-parser";
import { equalSplit } from "@/lib/core/splits";
import { indiaDateParts } from "@/lib/core/date";
import { dataContext } from "@/lib/server/context";
import { apiError, readJson } from "@/lib/server/http";

export async function POST(request:Request){
 try{
  const {text}=await readJson<{text?:string}>(request);
  const input=String(text||"").trim();
  if(!input)throw new Error("Tell Nudge what happened first.");
  const parsed=parseNudgeText(input,indiaDateParts().date);
  const ctx=await dataContext();

  if(parsed.intent==="expense"&&parsed.amount){
   const friends=parsed.friends||[];
   const split=equalSplit(parsed.amount,friends);
   return NextResponse.json({draft:{...parsed,personalAmount:split.personalAmount,splits:split.shares,receivable:split.shares.reduce((s,x)=>s+x.amount,0)}});
  }

  if(parsed.intent==="settlement"&&parsed.person&&parsed.amount){
   const target=parsed.person.toLowerCase();
   const open=ctx.data.splits
    .filter(s=>s.status!=="settled"&&s.person.toLowerCase().includes(target))
    .sort((a,b)=>(a.created_at||"").localeCompare(b.created_at||""));
   if(!open.length)return NextResponse.json({draft:{...parsed,intent:"unknown",clarification:`I couldn't find an open balance for ${parsed.person}. You can check Splits on the Money page.`}});
   let remaining=parsed.amount;
   const settlements=[] as Array<{splitId:string;person:string;amount:number}>;
   for(const split of open){if(remaining<=0)break;const due=Math.max(0,Number(split.their_share)-Number(split.settled_amount||0));const applied=Math.min(due,remaining);if(applied>0){settlements.push({splitId:split.id,person:split.person,amount:applied});remaining-=applied}}
   return NextResponse.json({draft:{...parsed,settlements,unmatchedAmount:Math.max(0,remaining),accountingNote:"This clears receivables only; it is never counted as income."}});
  }

  if(parsed.intent==="goal_contribution"&&parsed.goalName&&parsed.amount){
   const needle=parsed.goalName.toLowerCase();
   const goal=ctx.data.goals.find(g=>g.status!=="completed"&&(g.goal.toLowerCase().includes(needle)||needle.includes(g.goal.toLowerCase())));
   if(!goal)return NextResponse.json({draft:{...parsed,intent:"unknown",clarification:`I couldn't confidently match “${parsed.goalName}” to an active goal. Open Goals to choose it manually.`}});
   return NextResponse.json({draft:{...parsed,goalId:goal.id,goalName:goal.goal}});
  }

  return NextResponse.json({draft:parsed});
 }catch(error){return apiError(error)}
}
