import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, readJson } from "@/lib/server/http";
import { updateRecordById } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { settleSplit } from "@/lib/core/splits";
import { indiaDateParts } from "@/lib/core/date";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ splitId: string; amount?: number }>(request);
    const splitId = assertString(body.splitId, "Split ID");
    const ctx = await dataContext();
    const split = ctx.data.splits.find((s) => s.id === splitId);
    if (!split) throw new Error("Split not found.");
    const remaining = Math.max(0, Number(split.their_share) - Number(split.settled_amount || 0));
    if (remaining <= 0) return NextResponse.json({ ok: true, split });
    const amount = body.amount == null ? undefined : assertPositiveNumber(body.amount, "Settlement amount");
    const date = indiaDateParts().date;
    const updated = settleSplit(split, amount, date);
    if (!ctx.demo) await updateRecordById(ctx.session.accessToken, ctx.sheetId, "Splits", splitId, updated as unknown as Record<string, unknown>);
    const reward = await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "split_settled", date, ctx.data.rewards, ctx.demo);
    return NextResponse.json({ ok: true, split: updated, reward, accountingNote: "Settlement clears a receivable and is not counted as income." });
  } catch (error) {
    return apiError(error);
  }
}
