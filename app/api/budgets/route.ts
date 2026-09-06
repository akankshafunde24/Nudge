import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, id, readJson } from "@/lib/server/http";
import { appendRecord, updateRecordById } from "@/lib/server/sheets";
import { indiaDateParts } from "@/lib/core/date";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ month?: string; category: string; budget_amount: number }>(request);
    const ctx = await dataContext();
    const month = String(body.month || indiaDateParts().month);
    if (!/^\d{4}-\d{2}$/.test(month)) throw new Error("Month must be in YYYY-MM format.");
    const category = assertString(body.category, "Category");
    const budgetAmount = assertPositiveNumber(body.budget_amount, "Budget amount");
    const existing = ctx.data.budgets.find((b) => b.month === month && b.category.toLowerCase() === category.toLowerCase());
    const record = existing
      ? { ...existing, month, category, budget_amount: budgetAmount }
      : { id: id(), month, category, budget_amount: budgetAmount };
    if (!ctx.demo) {
      if (existing) await updateRecordById(ctx.session.accessToken, ctx.sheetId, "Budgets", existing.id, record as unknown as Record<string, unknown>);
      else await appendRecord(ctx.session.accessToken, ctx.sheetId, "Budgets", record);
    }
    return NextResponse.json({ ok: true, budget: record, updated: Boolean(existing) });
  } catch (error) {
    return apiError(error);
  }
}
