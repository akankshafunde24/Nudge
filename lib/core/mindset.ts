import type { FinanceSummary, GrowthState } from "./types";
import { percentChange } from "./finance";

export const DAILY_NUDGES = [
  "Do one small thing today that Future You will thank you for.",
  "Progress does not need to be dramatic to be real.",
  "Spend with intention, move with kindness, and leave room for joy.",
  "A calmer rhythm can still move you forward.",
  "You do not need a perfect day to make a good choice.",
  "Notice what helped today. Keep what works; release what does not."
];

export function dailyNudge(date = new Date()): string {
  const index = Math.floor(date.getTime() / 86_400_000) % DAILY_NUDGES.length;
  return DAILY_NUDGES[index];
}

export function ruleBasedInsight(current: FinanceSummary, previous: FinanceSummary, growth: GrowthState): string {
  const spendingChange = percentChange(current.personalSpending, previous.personalSpending);
  const parts: string[] = [];
  if (spendingChange == null) {
    parts.push(`You have recorded ₹${Math.round(current.personalSpending).toLocaleString("en-IN")} in personal spending this month.`);
  } else if (spendingChange <= -5) {
    parts.push(`Your personal spending is about ${Math.abs(spendingChange).toFixed(0)}% lower than last month so far.`);
  } else if (spendingChange >= 10) {
    parts.push(`This is a higher-spend month so far, about ${spendingChange.toFixed(0)}% above last month.`);
  } else {
    parts.push("Your spending is tracking fairly close to last month.");
  }
  if (current.topCategory) {
    parts.push(`${current.topCategory} is currently your largest category at ₹${Math.round(current.topCategoryAmount).toLocaleString("en-IN")}.`);
  }
  if (current.futureRate > 0) {
    parts.push(`You directed about ${current.futureRate.toFixed(0)}% of recorded income toward savings and investments.`);
  }
  if (growth.momentum === "strong") parts.push("Your recent check-in momentum is strong — consistency is showing up without needing perfection.");
  else if (growth.momentum === "rebuilding") parts.push("Your rhythm is rebuilding, and coming back counts as progress.");
  else if (growth.momentum === "resting") parts.push("This looks like a quieter stretch. Nothing has reset; your next small check-in simply continues the journey.");
  return parts.join(" ");
}
