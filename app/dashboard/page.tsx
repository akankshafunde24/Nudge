"use client";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { PageState } from "@/components/PageState";
import { PlantLifecycle, PlantVisual } from "@/components/PlantVisual";
import { MoneyRiver } from "@/components/MoneyRiver";
import { WealthGarden } from "@/components/WealthGarden";
import { GoalJourney } from "@/components/GoalJourney";
import { useNudgeData } from "@/lib/client/useNudgeData";
import { dailyNudge } from "@/lib/core/mindset";
import { indiaDateParts, indiaHour, NUDGE_TIME_ZONE } from "@/lib/core/date";

const money = (n:number) => `₹${Math.round(n).toLocaleString("en-IN")}`;
const titleStage = (s:string) => s[0].toUpperCase()+s.slice(1);

export default function DashboardPage(){
 const {data,loading,error,refresh}=useNudgeData(); const s=data?.snapshot;
 const {date:todayKey}=indiaDateParts();
 const today=new Intl.DateTimeFormat("en-IN",{timeZone:NUDGE_TIME_ZONE,weekday:"short",day:"numeric",month:"short",year:"numeric"}).format(new Date());
 const hour=indiaHour(); const greeting=hour<12?"morning":hour<18?"afternoon":"evening";
 const name=s?.settings.display_name || "you";
 const latestCheck=s?.checkIns.slice().sort((a,b)=>b.date.localeCompare(a.date))[0];
 const hasToday=latestCheck?.date===todayKey;
 const quests=[
  {done:(s?.transactions||[]).some(t=>t.date===todayKey),title:"Notice your money",note:"Logging one transaction is enough."},
  {done:Boolean(hasToday&&latestCheck.movement_minutes>0),title:"Move in a way that feels good",note:"Even a short walk counts."},
  {done:Boolean(hasToday),title:"Check in with yourself",note:"One minute, no perfect answers."}
 ];
 const todaySpend=(s?.transactions||[]).filter(t=>t.date===todayKey&&t.type==="expense").reduce((a,t)=>a+(t.personal_amount??t.amount),0);
 return <AppShell name={name} spreadsheetUrl={data?.spreadsheetUrl} demo={data?.demo} onRefresh={refresh}><PageState loading={loading} error={error}>{s&&<>
  <div className="page-head"><div><span className="eyebrow">Your day, gently organized</span><h1>Good {greeting}, {name}. 👋</h1><p>Small steps are still shaping the bigger picture.</p></div><span className="date-pill">{today}</span></div>
  <div className="dashboard-grid">
   <section className="card hero-dashboard"><div className="copy"><span className="eyebrow">Today’s Nudge</span><h2>You don’t need a perfect day to grow.</h2><p>{dailyNudge()}</p><div className="nudge-note"><span>☀️</span><div><b>One tiny focus</b><br/><span>Choose one useful thing, not ten impressive things.</span></div></div></div><div className="plant-side"><PlantVisual stage={s.growth.plantStage} resting={s.growth.momentum==="resting"}/></div></section>
   <section className="card growth-card"><div className="section-title"><h2>Your Growth Plant</h2><span>Lifetime progress</span></div><div className="growth-main"><PlantVisual stage={s.growth.plantStage} size="small" resting={s.growth.momentum==="resting"}/><div className="growth-copy"><span className="eyebrow">{s.growth.totalXp.toLocaleString()} XP · Level {s.growth.level}</span><h3>{titleStage(s.growth.plantStage)}</h3><p>{s.growth.momentum==="resting"?"A resting season. Your plant is still yours.":s.growth.momentum==="rebuilding"?"New growth is returning.":"Your rhythm is helping this plant grow."}</p><div className="xp-line"><span style={{width:`${s.growth.stageProgress}%`}}/></div><div className="momentum-chip">🔥 {s.growth.momentum} momentum · {s.growth.checkInDaysLast14}/14 check-ins</div></div></div><div style={{marginTop:24}}><PlantLifecycle current={s.growth.plantStage}/></div></section>
   <section className="card"><div className="section-title"><h2>Today at a glance</h2><span>No scores, just signals</span></div><div className="stats-grid"><div className="stat-card"><span className="icon">💸</span><strong>{money(todaySpend)}</strong><small>personal spend today</small></div><div className="stat-card"><span className="icon">🙂</span><strong>{hasToday?`${latestCheck.mood}/5`:"—"}</strong><small>{hasToday?"mood check-in":"check in when ready"}</small></div><div className="stat-card"><span className="icon">🚶</span><strong>{hasToday?`${latestCheck.movement_minutes} min`:"—"}</strong><small>movement</small></div><div className="stat-card"><span className="icon">🌱</span><strong>{money(s.finance.invested)}</strong><small>invested this month</small></div></div></section>
   <section className="card"><div className="section-title"><h2>Today’s tiny quests</h2><Link href="/track">See your rhythm →</Link></div><div className="quest-list">{quests.map(q=><div key={q.title} className={`quest-item ${q.done?"done":""}`}><span className="quest-check">{q.done?"✓":"·"}</span><div><b>{q.title}</b><small>{q.note}</small></div></div>)}</div></section>
   <section className="card"><div className="section-title"><h2>Your Money Flow</h2><Link href="/money">Explore money →</Link></div><MoneyRiver categories={s.finance.categoryTotals} income={s.finance.income}/><p className="helper">{s.finance.futureRate>0?`🌱 About ${s.finance.futureRate.toFixed(0)} of every ₹100 recorded as income went toward savings and investments this month.`:"Your future-allocation story appears as you record savings and investments."}</p></section>
   <section className="card"><div className="section-title"><h2>Your Wealth Garden</h2><Link href="/grow">Enter the garden →</Link></div><div className="big-number">{money(s.investment.currentValue)}</div><p className="helper">Current values are based on what you enter—Nudge does not fetch live market prices.</p><div className="spacer-18"/><WealthGarden allocation={s.investment.allocation} total={s.investment.currentValue}/></section>
   <section className="card"><div className="section-title"><h2>Goals in motion</h2><Link href="/goals">All goals →</Link></div>{s.goalProgress.length?<div className="goal-list">{s.goalProgress.slice(0,3).map(g=><GoalJourney key={g.id} name={g.goal} progress={g.progress} current={g.current_amount} target={g.target_amount} months={g.monthsRemaining} type={g.goal_type}/>)}</div>:<div className="empty-card compact"><span>🎯</span><p>Your first goal can be practical, playful, or both.</p></div>}</section>
   <section className="card"><div className="section-title"><h2>Future You</h2><span>Quiet progress</span></div><div className="healthy-copy">“Money can support the life you want without becoming the whole point of it.”</div><div className="stats-grid" style={{gridTemplateColumns:"repeat(2,1fr)",marginTop:18}}><div className="stat-card"><span className="icon">🛡️</span><strong>{money(s.finance.saved)}</strong><small>saved this month</small></div><div className="stat-card"><span className="icon">🤝</span><strong>{money(s.openReceivable)}</strong><small>friends owe you overall</small></div></div></section>
  </div>
 </>}</PageState></AppShell>
}
