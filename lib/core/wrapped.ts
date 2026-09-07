import type { DailyCheckIn, JournalEntry, RewardEvent, Transaction } from "./types";
import { buildFinanceSummary } from "./finance";

export interface WrappedStats {
  year: number;
  income: number;
  personalSpending: number;
  invested: number;
  saved: number;
  futureAllocation: number;
  topCategory: string | null;
  mostExpensiveMonth: string | null;
  lowestSpendMonth: string | null;
  largestPurchase: number;
  largestPurchaseLabel: string | null;
  movementDays: number;
  averageMood: number | null;
  checkInDays: number;
  journalDays: number;
  totalXp: number;
  coins: number;
  comebackCount: number;
  badgesUnlocked: number;
  themeWords: string[];
}

const STOP = new Set(["this","that","with","from","have","were","your","today","really","just","very","good","felt","into","about","after","before","there","their","would","could","should","what","when","where","which","been","being"]);

export function buildWrappedStats(year: number, transactions: Transaction[], checkIns: DailyCheckIn[], journal: JournalEntry[], rewards: RewardEvent[]): WrappedStats {
  const monthly = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`).map((m) => buildFinanceSummary(m, transactions, []));
  const annualIncome = monthly.reduce((s, m) => s + m.income, 0);
  const annualSpending = monthly.reduce((s, m) => s + m.personalSpending, 0);
  const annualInvested = monthly.reduce((s, m) => s + m.invested, 0);
  const annualSaved = monthly.reduce((s, m) => s + m.saved, 0);
  const catTotals: Record<string, number> = {};
  monthly.forEach((m) => Object.entries(m.categoryTotals).forEach(([k, v]) => catTotals[k] = (catTotals[k] || 0) + v));
  const topCategory = Object.entries(catTotals).sort((a,b) => b[1]-a[1])[0]?.[0] ?? null;
  const spendingMonths = monthly.filter((m) => m.personalSpending > 0);
  const most = [...spendingMonths].sort((a,b) => b.personalSpending-a.personalSpending)[0]?.period ?? null;
  const low = [...spendingMonths].sort((a,b) => a.personalSpending-b.personalSpending)[0]?.period ?? null;
  const yearTx=transactions.filter(t=>t.date.startsWith(String(year))&&t.type==="expense");
  const largest=[...yearTx].sort((a,b)=>Number(b.personal_amount??b.amount)-Number(a.personal_amount??a.amount))[0];
  const yearCheckins = checkIns.filter((c) => c.date.startsWith(String(year)));
  const averageMood = yearCheckins.length ? yearCheckins.reduce((s,c) => s + Number(c.mood || 0),0)/yearCheckins.length : null;
  const yearJournal = journal.filter((j) => j.date.startsWith(String(year)));
  const words = yearJournal.flatMap((j) => j.content.toLowerCase().replace(/[^a-z\s]/g," ").split(/\s+/)).filter((w) => w.length >= 4 && !STOP.has(w));
  const counts = new Map<string, number>();
  words.forEach((w) => counts.set(w, (counts.get(w) || 0) + 1));
  const themeWords = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5).map(([w])=>w);
  const yearRewards = rewards.filter((r) => r.date.startsWith(String(year)));
  return {
    year,
    income: annualIncome,
    personalSpending: annualSpending,
    invested: annualInvested,
    saved: annualSaved,
    futureAllocation: annualInvested + annualSaved,
    topCategory,
    mostExpensiveMonth: most,
    lowestSpendMonth: low,
    largestPurchase:Number(largest?.personal_amount??largest?.amount??0),
    largestPurchaseLabel:largest?.description||largest?.category||null,
    movementDays: yearCheckins.filter((c) => Number(c.movement_minutes || 0) > 0).length,
    averageMood,
    checkInDays: new Set(yearCheckins.map((c)=>c.date)).size,
    journalDays: new Set(yearJournal.map((j)=>j.date)).size,
    totalXp: yearRewards.reduce((s,r)=>s+Number(r.xp||0),0),
    coins: yearRewards.reduce((s,r)=>s+Number(r.coins||0),0),
    comebackCount:yearRewards.filter(r=>r.action==="comeback").length,
    badgesUnlocked:new Set(yearRewards.map(r=>r.badge).filter(Boolean)).size,
    themeWords
  };
}

export function wrappedTheme(stats: WrappedStats): string {
  if (stats.invested + stats.saved > stats.personalSpending * 0.35 && stats.checkInDays >= 180) return "The Year of Intentional Growth";
  if (stats.checkInDays >= 220) return "The Year of Showing Up";
  if (stats.movementDays >= 140) return "The Year of Finding Your Rhythm";
  if (stats.futureAllocation > 0) return "The Year of Building Future You";
  return "The Year of Small, Meaningful Steps";
}
