import { NextResponse } from "next/server";
import { buildWrappedStats, wrappedTheme } from "@/lib/core/wrapped";
import { wrappedNarrative } from "@/lib/server/ai";
import { dataContext } from "@/lib/server/context";
import { apiError, readJson } from "@/lib/server/http";
import { appendRecord, updateRecordById } from "@/lib/server/sheets";
import { indiaDateParts } from "@/lib/core/date";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ year?: number; force?: boolean }>(request);
    const currentYear = indiaDateParts().year;
    const year = Number(body.year || currentYear);
    if (!Number.isInteger(year) || year < 2000 || year > currentYear) throw new Error("Invalid year.");
    const ctx = await dataContext();
    const existing = ctx.data.wrapped.find((w) => Number(w.year) === year);
    if (existing && !body.force) {
      return NextResponse.json({ wrapped: JSON.parse(existing.json), cached: true });
    }
    const stats = buildWrappedStats(year, ctx.data.transactions, ctx.data.checkIns, ctx.data.journal, ctx.data.rewards);
    const theme = wrappedTheme(stats);
    const narrative = await wrappedNarrative(stats, theme);
    const wrapped = { year, theme, stats, narrative, generatedAt: new Date().toISOString() };
    const record = { year: String(year), json: JSON.stringify(wrapped), generated_at: wrapped.generatedAt };
    if (!ctx.demo) {
      if (existing) await updateRecordById(ctx.session.accessToken, ctx.sheetId, "Wrapped", String(year), record);
      else await appendRecord(ctx.session.accessToken, ctx.sheetId, "Wrapped", record);
    }
    return NextResponse.json({ wrapped, cached: false });
  } catch (error) { return apiError(error); }
}
