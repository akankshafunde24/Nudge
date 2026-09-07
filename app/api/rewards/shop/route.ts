import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, id, readJson } from "@/lib/server/http";
import { appendRecord, upsertSetting } from "@/lib/server/sheets";
import { indiaDateParts } from "@/lib/core/date";

const defaults=[{id:"coffee",icon:"☕",name:"Favourite coffee",cost:100},{id:"movie",icon:"🎬",name:"Movie evening",cost:250},{id:"selfcare",icon:"🌿",name:"Self-care hour",cost:500}];
function parse(raw?:string){try{const v=JSON.parse(raw||"");return Array.isArray(v)?v:defaults}catch{return defaults}}

export async function GET(){
 try{const ctx=await dataContext();const items=parse(ctx.data.settings.reward_shop);const coins=ctx.data.rewards.reduce((s,r)=>s+Number(r.coins||0),0);return NextResponse.json({items,coins})}catch(error){return apiError(error)}
}

export async function POST(request:Request){
 try{
  const body=await readJson<{action?:"save"|"redeem";items?:Array<{id:string;icon:string;name:string;cost:number}>;item?:{id:string;icon:string;name:string;cost:number}}>(request);
  const ctx=await dataContext();
  if(body.action==="save"){
   const items=(body.items||[]).slice(0,12).map(x=>({id:String(x.id||id()),icon:String(x.icon||"✨").slice(0,8),name:String(x.name||"").trim().slice(0,60),cost:Math.max(1,Math.round(Number(x.cost||0)))})).filter(x=>x.name);
   if(!ctx.demo)await upsertSetting(ctx.session.accessToken,ctx.sheetId,"reward_shop",JSON.stringify(items));
   return NextResponse.json({ok:true,items});
  }
  if(body.action==="redeem"&&body.item){
   const item=body.item;const balance=ctx.data.rewards.reduce((s,r)=>s+Number(r.coins||0),0);const cost=Math.max(1,Math.round(Number(item.cost||0)));if(balance<cost)throw new Error("Not enough Quest Coins yet — your reward is still waiting for you.");
   const reward={id:id(),date:indiaDateParts().date,action:"reward_redeemed",xp:0,coins:-cost,badge:`${item.icon||"✨"} ${String(item.name||"Reward").slice(0,60)}`,created_at:new Date().toISOString()};
   if(!ctx.demo)await appendRecord(ctx.session.accessToken,ctx.sheetId,"Rewards",reward);
   return NextResponse.json({ok:true,reward,balance:balance-cost});
  }
  throw new Error("Choose a reward action.");
 }catch(error){return apiError(error)}
}
