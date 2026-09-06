import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, assertPositiveNumber, assertString, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord } from "@/lib/server/sheets";

interface Body { goal: string; goal_type?: string; target_amount: number; current_amount?: number; target_date?: string; monthly_target?: number; priority?: string }
export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const ctx = await dataContext();
    const record = {
      id: id(), goal: assertString(body.goal, "Goal name"), goal_type: body.goal_type || "Personal", target_amount: assertPositiveNumber(body.target_amount, "Target amount"),
      current_amount: Math.max(0, Number(body.current_amount || 0)), target_date: body.target_date || "", monthly_target: Math.max(0, Number(body.monthly_target || 0)),
      priority: body.priority || "Medium", status: "active", created_at: nowIso()
    };
    if (!ctx.demo) await appendRecord(ctx.session.accessToken, ctx.sheetId, "Goals", record);
    return NextResponse.json({ ok: true, goal: record });
  } catch (error) { return apiError(error); }
}
