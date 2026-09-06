"use client";
import { AppShell } from "@/components/AppShell";
import { PageState } from "@/components/PageState";
import { PlantLifecycle, PlantVisual } from "@/components/PlantVisual";
import { useNudgeData } from "@/lib/client/useNudgeData";
import { logicalIndiaDate } from "@/lib/core/date";

const moods=["😞","😕","😐","🙂","😊"];
export default function TrackPage(){
 const {data,loading,error,refresh}=useNudgeData(); const s=data?.snapshot;
 const activeDates=new Set(s?.checkIns.map(c=>c.date)||[]); const base=logicalIndiaDate(); const days=Array.from({length:14},(_,i)=>{const d=new Date(base);d.setUTCDate(d.getUTCDate()-(13-i));return {date:d.toISOString().slice(0,10),label:d.getUTCDate()}});
 const recent=s?.checkIns.slice().sort((a,b)=>b.date.localeCompare(a.date)).slice(0,6)||[];
 return <AppShell name={s?.settings.display_name||"you"} spreadsheetUrl={data?.spreadsheetUrl} demo={data?.demo} onRefresh={refresh}><PageState loading={loading} error={error}>{s&&<>
  <div className="page-head"><div><span className="eyebrow">A tracker that does not grade you</span><h1>How have you been, lately?</h1><p>Nudge looks for rhythm and returns—not flawless streaks.</p></div><span className="date-pill">🔥 {s.growth.momentum} momentum</span></div>
  <div className="track-grid"><section className="card growth-card"><div className="section-title"><h2>Your Growth Plant</h2><span>{s.growth.totalXp} XP</span></div><div className="growth-main"><PlantVisual stage={s.growth.plantStage} resting={s.growth.momentum==="resting"}/><div className="growth-copy"><span className="eyebrow">Level {s.growth.level}</span><h3>{s.growth.plantStage}</h3><p>{s.growth.momentum==="resting"?"Resting is a state, not a failure. One check-in continues the same plant.":s.growth.momentum==="rebuilding"?"New growth is appearing again. Welcome back.":"Your recent rhythm is giving the plant steady care."}</p></div></div><div style={{marginTop:20}}><PlantLifecycle current={s.growth.plantStage}/></div></section>
   <section className="card"><span className="eyebrow">Healthy mindset</span><div className="healthy-copy">“A missed day does not erase a cared-for life.”</div><p className="helper">Plant stage is lifetime XP and never decreases. Momentum describes only the last 14 days, so it can rest and rebuild without resetting your progress.</p><div className="nudge-note"><span>🌱</span><div><b>Comeback reward</b><br/><span>Return after a longer gap and Nudge celebrates the restart instead of pointing at what you missed.</span></div></div></section></div>
  <div className="spacer-18"/>
  <section className="card"><div className="section-title"><h2>Your last 14 days</h2><span>{s.growth.checkInDaysLast14}/14 gentle check-ins</span></div><div className="momentum-calendar">{days.map(d=><div title={d.date} key={d.date} className={`day-dot ${activeDates.has(d.date)?"active":""}`}>{activeDates.has(d.date)?"✓":d.label}</div>)}</div></section>
  <div className="spacer-18"/>
  <section className="card"><div className="section-title"><h2>Recent reflections</h2><span>What your days felt like</span></div>{recent.length?<div className="checkin-cards">{recent.map(c=><article className="checkin-card" key={c.id}><div className="mood-face">{moods[Math.max(0,Math.min(4,c.mood-1))]}</div><strong>{c.date} · energy {c.energy}/5</strong><p>{c.movement_minutes?`${c.movement_minutes} min movement · `:""}{c.food_feeling.replace("_"," ")}</p>{c.proud_of_today&&<p>💛 {c.proud_of_today}</p>}</article>)}</div>:<div className="empty-card" style={{minHeight:210}}><span>☀️</span><h3>Your first check-in can be one minute</h3><p>Use Quick add → Check-in. No calorie counting, no productivity grading.</p></div>}</section>
 </>}</PageState></AppShell>
}
