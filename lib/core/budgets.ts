import type { Budget, BudgetProgress } from "./types.js";

export function buildBudgetProgress(month: string, budgets: Budget[], categoryTotals: Record<string, number>): BudgetProgress[] {
  return budgets
    .filter((b) => b.month === month && Number(b.budget_amount) > 0)
    .map((b): BudgetProgress => {
      const budget = Number(b.budget_amount || 0);
      const spent = Math.max(0, Number(categoryTotals[b.category] || 0));
      const progress = budget > 0 ? (spent / budget) * 100 : 0;
      const status: BudgetProgress["status"] = progress > 100 ? "over" : progress >= 80 ? "near" : "within";
      return { ...b, spent, remaining: budget - spent, progress, status };
    })
    .sort((a, b) => b.progress - a.progress);
}
