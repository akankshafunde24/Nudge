import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertString, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { indiaDateParts } from "@/lib/core/date";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ date?: string; entry_type?: "journal"|"gratitude"|"moment"|"quick_memory"; content: string; mood?: number }>(request);
    const ctx = await dataContext();
    const date = body.date || indiaDateParts().date;
    const record = { id: id(), date, entry_type: body.entry_type || "journal", content: assertString(body.content, "Journal entry"), mood: body.mood ? Math.min(5, Math.max(1, Number(body.mood))) : 0, created_at: nowIso() };
    if (!ctx.demo) await appendRecord(ctx.session.accessToken, ctx.sheetId, "Journal", record);
    const reward = await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "journal_written", date, ctx.data.rewards, ctx.demo);
    return NextResponse.json({ ok: true, entry: record, reward });
  } catch (error) { return apiError(error); }
}
