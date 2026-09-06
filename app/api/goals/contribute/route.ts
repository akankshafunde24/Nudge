import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord, updateRecordById } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { indiaDateParts } from "@/lib/core/date";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ goalId: string; amount: number; date?: string }>(request);
    const ctx = await dataContext();
    const goalId = assertString(body.goalId, "Goal ID");
    const amount = assertPositiveNumber(body.amount, "Contribution");
    const goal = ctx.data.goals.find((g) => g.id === goalId);
    if (!goal) throw new Error("Goal not found.");
    const date = body.date || indiaDateParts().date;
    const updated = { ...goal, current_amount: Number(goal.current_amount || 0) + amount, status: Number(goal.current_amount || 0) + amount >= Number(goal.target_amount) ? "completed" : goal.status };
    const tx = { id: id(), date, time: "", type: "saving", amount, currency: "INR", category: "Savings", subcategory: goal.goal_type, description: `Goal contribution · ${goal.goal}`, payment_method: "", merchant: "", need_or_want: "neutral", event_tag: "Goal", goal_id: goal.id, personal_amount: amount, split_amount: 0, notes: "", created_at: nowIso() };
    if (!ctx.demo) {
      await updateRecordById(ctx.session.accessToken, ctx.sheetId, "Goals", goal.id, updated as unknown as Record<string, unknown>);
      await appendRecord(ctx.session.accessToken, ctx.sheetId, "Transactions", tx);
    }
    const reward = await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "goal_contribution", date, ctx.data.rewards, ctx.demo);
    return NextResponse.json({ ok: true, goal: updated, transaction: tx, reward });
  } catch (error) { return apiError(error); }
}
