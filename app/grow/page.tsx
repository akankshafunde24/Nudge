"use client";
import { AppShell } from "@/components/AppShell";
import { PageState } from "@/components/PageState";
import { WealthGarden } from "@/components/WealthGarden";
import { GoalJourney } from "@/components/GoalJourney";
import { SafetyShield } from "@/components/SafetyShield";
import { useNudgeData } from "@/lib/client/useNudgeData";

const money=(n:number)=>`₹${Math.round(n).toLocaleString("en-IN")}`;

export default function GrowPage(){
 const {data,loading,error,refresh}=useNudgeData(); const s=data?.snapshot;
 const assets=s?.investment.assets||[];
 const safetyGoal=s?.goals.find(g=>g.status!=="completed"&&(g.goal_type.toLowerCase().includes("safety")||g.goal.toLowerCase().includes("emergency")));
 const safetySaved=Number(safetyGoal?.current_amount||0); const essential=Number(s?.settings.essential_expenses||0);
 return <AppShell name={s?.settings.display_name||"you"} spreadsheetUrl={data?.spreadsheetUrl} demo={data?.demo} onRefresh={refresh}><PageState loading={loading} error={error}>{s&&<>
  <div className="page-head"><div><span className="eyebrow">Grow · educational investing view</span><h1>Your Wealth Garden.</h1><p>See what you’re consistently building without turning investing into a scoreboard.</p></div><span className="date-pill">🌿 {s.settings.investor_profile||"Profile not set"}</span></div>
  <div className="garden-hero"><section className="card profile-card"><span className="eyebrow">Your investing profile</span><div className="profile-name">{s.settings.investor_profile||"Still discovering your style"}</div><p className="helper">Risk comfort: <b>{s.settings.risk_comfort||"Not set"}</b> · Horizon: <b>{s.settings.investment_horizon||"Not set"}</b></p><div className="nudge-note"><span>🧭</span><div><b>Profile, not prescription</b><br/><span>Nudge uses this only to frame educational context. It does not tell you what security to buy or predict returns.</span></div></div></section>
   <section className="card"><div className="section-title"><h2>Portfolio garden</h2><span>Manual current values</span></div><div className="portfolio-number">{money(s.investment.currentValue)}</div><div className={`delta ${s.investment.gainLoss>=0?"good":"soft"}`}>{s.investment.gainLoss>=0?"+":""}{money(s.investment.gainLoss)} vs recorded net contributions</div><div className="spacer-18"/><WealthGarden allocation={s.investment.allocation} total={s.investment.currentValue}/><p className="helper">Use Quick add → Invest → Update value whenever you want to refresh a holding. No live-market API is required.</p></section></div>
  <div className="spacer-18"/>
  <section className="card"><SafetyShield saved={safetySaved} essential={essential}/></section>
  <div className="spacer-18"/>
  <section className="card"><div className="section-title"><h2>What is growing</h2><span>{s.investment.activeAssets} tracked assets</span></div>{assets.length?<div className="investment-grid">{assets.map((a,i)=><article key={`${a.type}:${a.name}`} className="investment-card"><span className="plant">{["🌿","🪴","🌱","🌵"][i%4]}</span><h4>{a.name}</h4><p>{a.type}</p><div className="spacer-18"/><strong>{money(a.currentValue)}</strong><p>Net contributions: {money(a.invested)}</p><small className={a.gainLoss>=0?"positive-text":"muted-text"}>{a.gainLoss>=0?"+":""}{money(a.gainLoss)} recorded change · updated {a.lastUpdated||"—"}</small></article>)}</div>:<div className="empty-card" style={{minHeight:220}}><span>🌱</span><h3>Your garden starts with the first contribution</h3><p>Use Quick add → Invest. Nudge mirrors contributions into both Investments and your money ledger.</p></div>}</section>
  <div className="spacer-18"/>
  <div className="money-top"><section className="card"><div className="section-title"><h2>Allocation, softly shown</h2><span>No target recommendations</span></div>{Object.keys(s.investment.allocation).length?<div className="allocation-pills">{Object.entries(s.investment.allocation).map(([k,v])=><span key={k}>{k} · {s.investment.currentValue?((v/s.investment.currentValue)*100).toFixed(0):0}%</span>)}</div>:<p className="helper">Your allocation appears after you record investments.</p>}<div className="spacer-18"/><p className="helper">These percentages describe your recorded portfolio; they are not a recommendation for what your allocation should be.</p></section>
   <section className="card"><div className="section-title"><h2>Future-you goals</h2><span>Savings + investment context</span></div>{s.goalProgress.length?<div className="goal-list">{s.goalProgress.slice(0,3).map(g=><GoalJourney key={g.id} name={g.goal} progress={g.progress} current={g.current_amount} target={g.target_amount} months={g.monthsRemaining} type={g.goal_type}/>)}</div>:<div className="empty-card compact"><span>🧭</span><p>Add a goal when you want your money to point somewhere meaningful.</p></div>}</section></div>
 </>}</PageState></AppShell>
}
