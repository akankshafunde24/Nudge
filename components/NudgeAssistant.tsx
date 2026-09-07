"use client";
import { FormEvent, useEffect, useState } from "react";
import { apiPost } from "@/lib/client/api";
import { queueOffline } from "@/lib/client/offline";

type Draft={
 intent:string;original:string;date:string;amount?:number;category?:string;description?:string;friends?:string[];personalAmount?:number;receivable?:number;splits?:Array<{person:string;amount:number}>;
 person?:string;assetName?:string;assetType?:string;goalName?:string;goalId?:string;movementMinutes?:number;mood?:number;content?:string;assumption?:string;clarification?:string;
 settlements?:Array<{splitId:string;person:string;amount:number}>;unmatchedAmount?:number;accountingNote?:string;
};
const money=(n:number)=>`₹${Math.round(n*100)/100}`;

export function NudgeAssistant({onClose,onSaved,onManual}:{onClose:()=>void;onSaved:(message:string)=>void;onManual:()=>void}){
 const [text,setText]=useState("");const[draft,setDraft]=useState<Draft|null>(null);const[busy,setBusy]=useState(false);const[error,setError]=useState("");const[answer,setAnswer]=useState("");
 useEffect(()=>{try{setText(localStorage.getItem("nudge:assistantDraft")||"")}catch{}},[]);
 useEffect(()=>{try{if(text)localStorage.setItem("nudge:assistantDraft",text);else localStorage.removeItem("nudge:assistantDraft")}catch{}},[text]);
 async function understand(e?:FormEvent){e?.preventDefault();if(!text.trim())return;setBusy(true);setError("");setAnswer("");setDraft(null);try{const r=await apiPost<{draft:Draft}>("/api/nudge/interpret",{text});if(r.draft.intent==="question"){const q=await apiPost<{answer:string}>("/api/insights",{question:text});setAnswer(q.answer)}else setDraft(r.draft)}catch(e){setError(e instanceof Error?e.message:"Nudge could not understand that yet.")}finally{setBusy(false)}}
 async function confirm(){if(!draft)return;setBusy(true);setError("");let offlineSaved=false;try{
  if(draft.intent==="expense"||draft.intent==="income"||draft.intent==="refund"){
   const body={client_id:crypto.randomUUID().replaceAll("-",""),date:draft.date,type:draft.intent,amount:draft.amount,category:draft.category,description:draft.description,splits:draft.splits||[]};
   try{await apiPost("/api/transactions",body)}catch(e){if(!navigator.onLine||e instanceof TypeError){await queueOffline("/api/transactions",body);offlineSaved=true}else throw e}
  }
  else if(draft.intent==="investment")await apiPost("/api/investments",{date:draft.date,asset_name:draft.assetName,asset_type:draft.assetType||"Other",amount_invested:draft.amount,transaction_type:"buy"});
  else if(draft.intent==="goal_contribution")await apiPost("/api/goals/contribute",{goalId:draft.goalId,amount:draft.amount,date:draft.date});
  else if(draft.intent==="settlement")for(const s of draft.settlements||[])await apiPost("/api/splits/settle",{splitId:s.splitId,amount:s.amount});
  else if(draft.intent==="checkin")await apiPost("/api/checkins",{date:draft.date,mood:draft.mood||3,energy:3,movement_minutes:draft.movementMinutes||0,food_feeling:"not_sure",reflection:draft.description||draft.original});
  else if(draft.intent==="journal")await apiPost("/api/journal",{date:draft.date,entry_type:"quick_memory",content:draft.content||draft.original});
  else throw new Error("This one needs the manual form so you can choose the missing details.");
  localStorage.removeItem("nudge:assistantDraft");setText("");onSaved(offlineSaved?"Saved offline. Nudge will sync the money update when you reconnect. ☁️":draft.intent==="settlement"?"Balance updated — repayment stayed out of income. 🤝":"Nudge saved it. One sentence was enough. 🌱");onClose();
 }catch(e){setError(e instanceof Error?e.message:"Could not save this update.")}finally{setBusy(false)}}
 return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><section className="modal-card assistant-modal" role="dialog" aria-modal="true" aria-label="Tell Nudge anything">
  <div className="modal-head"><div><span className="eyebrow">✨ Nudge assistant</span><h2>Tell Nudge what happened.</h2></div><button onClick={onClose} aria-label="Close">×</button></div>
  <p className="helper">Ask a question or describe one thing naturally. Nudge interprets first, shows a preview, and only writes after you confirm.</p>
  <form className="assistant-input" onSubmit={understand}><textarea autoFocus rows={3} value={text} onChange={e=>{setText(e.target.value);setDraft(null);setAnswer("")}} placeholder="Dinner with Neha and Anjali, I paid ₹1,500"/><button className="primary" disabled={busy||!text.trim()}>{busy?"Understanding…":"Understand →"}</button></form>
  <div className="assistant-examples"><button onClick={()=>setText("Spent 450 on groceries")}>Spent ₹450 on groceries</button><button onClick={()=>setText("Neha returned 500 she owed me")}>Neha returned ₹500</button><button onClick={()=>setText("Why did I spend more this month?")}>Why did I spend more?</button></div>
  {answer&&<div className="assistant-answer"><span className="eyebrow">Nudge says</span><p>{answer}</p></div>}
  {draft&&<Preview draft={draft}/>} 
  {draft&&draft.intent!=="unknown"&&<div className="assistant-actions"><button className="secondary" onClick={()=>setDraft(null)} disabled={busy}>Edit sentence</button><button className="primary" onClick={confirm} disabled={busy}>{busy?"Saving…":"Looks right ✓"}</button></div>}
  {draft?.intent==="unknown"&&<div className="assistant-actions"><button className="secondary" onClick={()=>setDraft(null)}>Try another wording</button><button className="primary" onClick={onManual}>Add manually</button></div>}
  {error&&<p className="form-error">{error}</p>}
 </section></div>
}

function Preview({draft}:{draft:Draft}){
 if(draft.intent==="unknown")return <div className="assistant-preview"><span className="eyebrow">One detail is missing</span><h3>I don’t want to guess.</h3><p>{draft.clarification||"I couldn't confidently turn that into a safe action. Try a little more detail or use the manual form."}</p></div>;
 return <div className="assistant-preview"><span className="eyebrow">Nudge understood this</span>
  <div className="preview-title"><div><h3>{draft.description||label(draft.intent)}</h3><small>{draft.date}</small></div>{draft.amount!=null&&<strong>{money(draft.amount)}</strong>}</div>
  {draft.intent==="expense"&&<><div className="preview-grid"><div><small>Category</small><b>{draft.category}</b></div><div><small>Your expense</small><b>{money(draft.personalAmount||draft.amount||0)}</b></div>{Boolean(draft.receivable)&&<div><small>Friends owe</small><b>{money(draft.receivable||0)}</b></div>}</div>{(draft.splits||[]).map(s=><div className="preview-person" key={s.person}><span>{s.person} owes you</span><b>{money(s.amount)}</b></div>)}{draft.assumption&&<p className="assistant-assumption">💡 {draft.assumption}</p>}</>}
  {draft.intent==="investment"&&<div className="preview-grid"><div><small>Holding</small><b>{draft.assetName}</b></div><div><small>Type</small><b>{draft.assetType}</b></div></div>}
  {draft.intent==="goal_contribution"&&<p>🎯 Add {money(draft.amount||0)} to <b>{draft.goalName}</b>.</p>}
  {draft.intent==="checkin"&&<div className="preview-grid">{draft.movementMinutes!=null&&<div><small>Movement</small><b>{draft.movementMinutes} min</b></div>}{draft.mood&&<div><small>Mood</small><b>{draft.mood}/5</b></div>}</div>}
  {draft.intent==="settlement"&&<>{(draft.settlements||[]).map(s=><div className="preview-person" key={s.splitId}><span>Clear {s.person}'s receivable</span><b>{money(s.amount)}</b></div>)}{Boolean(draft.unmatchedAmount)&&<p className="assistant-assumption">I found less open balance than the amount mentioned; {money(draft.unmatchedAmount||0)} will not be recorded.</p>}<p className="helper">{draft.accountingNote}</p></>}
  {draft.intent==="journal"&&<p>✎ {draft.content}</p>}
 </div>
}
const label=(intent:string)=>intent.split("_").map(x=>x[0]?.toUpperCase()+x.slice(1)).join(" ");
