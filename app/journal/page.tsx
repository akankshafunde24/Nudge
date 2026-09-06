"use client";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { PageState } from "@/components/PageState";
import { useNudgeData } from "@/lib/client/useNudgeData";
import { apiPost } from "@/lib/client/api";

export default function JournalPage(){
 const {data,loading,error,refresh}=useNudgeData(); const s=data?.snapshot; const [content,setContent]=useState(""); const [type,setType]=useState("quick_memory"); const [busy,setBusy]=useState(false);
 async function save(){if(!content.trim())return;setBusy(true);try{await apiPost("/api/journal",{entry_type:type,content});setContent("");await refresh()}finally{setBusy(false)}}
 return <AppShell name={s?.settings.display_name||"you"} spreadsheetUrl={data?.spreadsheetUrl} demo={data?.demo} onRefresh={refresh}><PageState loading={loading} error={error}>{s&&<>
  <div className="page-head"><div><span className="eyebrow">Collect moments, not homework</span><h1>Your little memory shelf.</h1><p>A sentence is enough. The journal stays intentionally light.</p></div><span className="date-pill">✎ {s.journal.length} saved moments</span></div>
  <div className="money-top"><section className="card"><span className="eyebrow">A new moment</span><h2>What do you want to remember?</h2><div className="choice-row" style={{margin:"14px 0"}}>{[["quick_memory","Quick memory"],["gratitude","Gratitude"],["journal","Journal"],["moment","Moment"]].map(([v,l])=><button key={v} className={`choice ${type===v?"chosen":""}`} onClick={()=>setType(v)}>{l}</button>)}</div><textarea rows={7} value={content} onChange={e=>setContent(e.target.value)} placeholder="Dinner and ridiculous jokes with friends. A peaceful commute. Something I learned. A win I almost ignored…"/><button className="primary wide" style={{marginTop:10}} disabled={busy||!content.trim()} onClick={save}>{busy?"Keeping it…":"Keep this moment"}</button></section><section className="card profile-card"><span className="eyebrow">Why it stays simple</span><div className="healthy-copy">“Collect moments, not things to complete.”</div><p className="helper">Nudge uses journal metadata and optional theme words for Wrapped. Raw journal entries are not sent to AI by default.</p><div className="nudge-note"><span>💛</span><div><b>No daily journal requirement</b><br/><span>Write when there is something worth keeping—or when writing helps you notice it.</span></div></div></section></div>
  <div className="spacer-18"/>
  {s.journal.length?<section className="journal-grid">{s.journal.map(j=><article className="journal-card" key={j.id}><span className="journal-type">{j.entry_type.replace("_"," ")}</span><p>{j.content}</p><small>{j.date}</small></article>)}</section>:<div className="empty-card"><span>📖</span><h3>Your shelf has room</h3><p>The first entry can be one funny line, one gratitude, or one thing you want Future You to remember.</p></div>}
 </>}</PageState></AppShell>
}
