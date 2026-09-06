import { NextResponse } from "next/server";
import { optionalEnv } from "@/lib/server/env";
import { buildWrappedStats, wrappedTheme } from "@/lib/core/wrapped";
import { wrappedNarrative } from "@/lib/server/ai";
import { appendRecord, findNudgeSheetForServiceAccount, getServiceAccountToken, loadSheetData, updateRecordById } from "@/lib/server/sheets";
import { indiaDateParts } from "@/lib/core/date";

export async function GET(request: Request) {
  const secret = optionalEnv("CRON_SECRET");
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { date } = indiaDateParts();
  const [year, month, day] = date.split("-").map(Number);
  if (month !== 12 || day !== 31) return NextResponse.json({ ok: true, skipped: "Not December 31 in Asia/Kolkata." });
  const token = await getServiceAccountToken();
  if (!token) return NextResponse.json({ ok: true, skipped: "Service-account bridge is not configured. Login-time Wrapped remains available." });
  const sheetId = await findNudgeSheetForServiceAccount(token);
  if (!sheetId) return NextResponse.json({ ok: true, skipped: "No Nudge sheet has been shared with the service account." });
  const data = await loadSheetData(token, sheetId);
  const stats = buildWrappedStats(year, data.transactions, data.checkIns, data.journal, data.rewards);
  const theme = wrappedTheme(stats);
  const narrative = await wrappedNarrative(stats, theme);
  const wrapped = { year, theme, stats, narrative, generatedAt: new Date().toISOString() };
  const record = { year: String(year), json: JSON.stringify(wrapped), generated_at: wrapped.generatedAt };
  const existing = data.wrapped.find((w) => Number(w.year) === year);
  if (existing) await updateRecordById(token, sheetId, "Wrapped", String(year), record);
  else await appendRecord(token, sheetId, "Wrapped", record);
  return NextResponse.json({ ok: true, year, generated: true });
}
