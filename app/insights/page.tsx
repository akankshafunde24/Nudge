"use client";
import { AppShell } from "@/components/AppShell";
import { PageState } from "@/components/PageState";
import { useNudgeData } from "@/lib/client/useNudgeData";
import { logicalIndiaDate } from "@/lib/core/date";
import { percentChange } from "@/lib/core/finance";

const money=(n:number)=>`₹${Math.round(n).toLocaleString("en-IN")}`;
const average=(values:number[])=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;

export default function InsightsPage(){
 const {data,loading,error,refresh}=useNudgeData();const s=data?.snapshot;
 const base=logicalIndiaDate();const start=new Date(base);start.setUTCDate(start.getUTCDate()-6);const startKey=start.toISOString().slice(0,10);const endKey=base.toISOString().slice(0,10);
 const weekTx=(s?.transactions||[]).filter(t=>t.date>=startKey&&t.date<=endKey);
 const weeklySpend=weekTx.filter(t=>t.type==="expense").reduce((a,t)=>a+(t.personal_amount??t.amount),0)-weekTx.filter(t=>t.type==="refund").reduce((a,t)=>a+t.amount,0);
 const weekChecks=(s?.checkIns||[]).filter(c=>c.date>=startKey&&c.date<=endKey);const movementDays=weekChecks.filter(c=>c.movement_minutes>0).length;const weekMood=average(weekChecks.map(c=>c.mood));
 const movingMoods=weekChecks.filter(c=>c.movement_minutes>0).map(c=>c.mood);const stillMoods=weekChecks.filter(c=>c.movement_minutes===0).map(c=>c.mood);const movingAvg=average(movingMoods),stillAvg=average(stillMoods);
 const spendChange=s?percentChange(s.finance.personalSpending,s.previousFinance.personalSpending):null;
 const moodObservation=movingAvg!=null&&stillAvg!=null&&movingMoods.length>=2&&stillMoods.length>=2?`Your recorded mood averaged ${movingAvg.toFixed(1)}/5 on movement days and ${stillAvg.toFixed(1)}/5 on other check-in days. That is an association in your entries, not proof that one caused the other.`:"As more check-ins build up, Nudge can surface gentle associations between movement and recorded mood without claiming causation.";
 const monthCharacter=!s?"Month still unfolding":s.finance.futureRate>=25?"Future You month":s.growth.momentum==="strong"?"Rhythm-building month":spendChange!=null&&spendChange>20?"A fuller-life month":"Intentional Reset month";
 const weeklyObservation=!s?"":movementDays>=4?"Movement showed up often this week — not perfectly, just repeatedly.":weeklySpend>0?`You recorded ${money(weeklySpend)} of personal spending this week. The useful part is that the story is visible.`:"This week is still light on recorded signals. You do not need to backfill it.";
 const nextQuest=!s?"One small check-in":s.openReceivable>0?"Close or review one friend balance":s.finance.futureRate<10?"Make one small Future You move":weekChecks.length<3?"Do one one-minute check-in":"Keep one thing simple next week";
 return <AppShell name={s?.settings.display_name||"you"} spreadsheetUrl={data?.spreadsheetUrl} demo={data?.demo} onRefresh={refresh}><PageState loading={loading} error={error}>{s&&<>
  <div className="page-head"><div><span className="eyebrow">Perspective, not performance</span><h1>Your Nudge stories.</h1><p>Weekly and monthly reflections using what you actually recorded.</p></div><span className="date-pill">{startKey} → {endKey}</span></div>
  <section className="card sunday-reset"><div><span className="eyebrow">☀️ Sunday Reset · works any day</span><h2>What did this week feel like?</h2><p>{weeklyObservation}</p></div><div className="reset-quest"><small>Your next tiny quest</small><strong>{nextQuest}</strong><span>No streak attached. Just one useful nudge.</span></div></section>
  <div className="spacer-18"/>
  <div className="story-grid"><section className="card story-card weekly-story"><span className="eyebrow">🌿 Your last 7 days</span><h2>{weekChecks.length>=4?"A week with some rhythm.":"A week still taking shape."}</h2><div className="story-numbers"><div><strong>{money(Math.max(0,weeklySpend))}</strong><small>personal spend</small></div><div><strong>{movementDays}</strong><small>movement days</small></div><div><strong>{weekMood?`${weekMood.toFixed(1)}/5`:"—"}</strong><small>recorded mood</small></div><div><strong>{weekChecks.length}/7</strong><small>check-ins</small></div></div><p>{weekChecks.length?"You showed up often enough to notice the week without needing to document every detail.":"No need to catch up. Your next check-in can simply start from today."}</p></section>
   <section className="card story-card"><span className="eyebrow">💛 A pattern worth noticing</span><h2>Movement & mood</h2><div className="healthy-copy">{moodObservation}</div></section>
   <section className="card story-card monthly-story"><span className="eyebrow">✨ This month so far</span><h2>{monthCharacter}</h2><div className="story-numbers"><div><strong>{money(s.finance.personalSpending)}</strong><small>personal spend</small></div><div><strong>{money(s.finance.futureAllocation)}</strong><small>saved + invested</small></div><div><strong>{s.finance.topCategory||"—"}</strong><small>largest category</small></div><div><strong>{s.finance.futureRate.toFixed(0)}%</strong><small>future allocation / income</small></div></div><p>{spendChange==null?"This month does not yet have a useful previous-month baseline.":spendChange<=0?`Recorded personal spending is ${Math.abs(spendChange).toFixed(0)}% lower than last month. That is context, not a target to keep cutting.`:`Recorded personal spending is ${spendChange.toFixed(0)}% higher than last month. Nudge treats that as something to understand, not something to feel guilty about.`}</p></section>
   <section className="card story-card"><span className="eyebrow">🌱 Growth signal</span><h2>{s.growth.plantStage[0].toUpperCase()+s.growth.plantStage.slice(1)} · {s.growth.momentum} momentum</h2><p>Your plant reflects lifetime XP, so a quiet week cannot erase earlier growth. Momentum only describes your recent rhythm.</p><div className="nudge-note"><span>🪴</span><div><b>{s.growth.checkInDaysLast14}/14 recent check-in days</b><br/><span>{s.growth.momentum==="resting"?"A resting season is allowed. Returning grows the same plant.":"Keep the system small enough that it remains easy to return to."}</span></div></div></section>
  </div>
 </>}</PageState></AppShell>
}
