import { NextResponse } from "next/server";
import type { FoodFeeling } from "@/lib/core/types";
import { buildGrowthState } from "@/lib/core/growth";
import { dataContext } from "@/lib/server/context";
import { apiError, id, nowIso, readJson } from "@/lib/server/http";
import { appendRecord, updateRecordById } from "@/lib/server/sheets";
import { maybeWriteReward } from "@/lib/server/reward-write";
import { indiaDateParts } from "@/lib/core/date";

interface Body { date?: string; mood: number; energy: number; movement_minutes?: number; movement_type?: string; food_feeling?: FoodFeeling; today_intention?: string; something_enjoyed?: string; proud_of_today?: string; reflection?: string }

export async function POST(request: Request) {
  try {
    const body = await readJson<Body>(request);
    const ctx = await dataContext();
    const date = body.date || indiaDateParts().date;
    const mood = Math.min(5, Math.max(1, Number(body.mood || 3)));
    const energy = Math.min(5, Math.max(1, Number(body.energy || 3)));
    const existing = ctx.data.checkIns.find((c) => c.date === date);
    const record = {
      id: existing?.id || id(), date, mood, energy, movement_minutes: Math.max(0, Number(body.movement_minutes || 0)), movement_type: body.movement_type || "",
      food_feeling: body.food_feeling || "not_sure", today_intention: body.today_intention || "", something_enjoyed: body.something_enjoyed || "",
      proud_of_today: body.proud_of_today || "", reflection: body.reflection || "", created_at: existing?.created_at || nowIso()
    };
    const before = buildGrowthState(ctx.data.rewards, ctx.data.checkIns, new Date(`${date}T12:00:00Z`));
    if (!ctx.demo) {
      if (existing) await updateRecordById(ctx.session.accessToken, ctx.sheetId, "Daily_CheckIns", existing.id, record);
      else await appendRecord(ctx.session.accessToken, ctx.sheetId, "Daily_CheckIns", record);
    }
    const rewards = [];
    const base = await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "checkin_completed", date, ctx.data.rewards, ctx.demo);
    if (base) rewards.push(base);
    if (!existing && before.isComebackWindow) {
      const comeback = await maybeWriteReward(ctx.session.accessToken, ctx.sheetId, "comeback", date, ctx.data.rewards, ctx.demo);
      if (comeback) rewards.push(comeback);
    }
    return NextResponse.json({ ok: true, checkIn: record, rewards, message: before.isComebackWindow ? "Welcome back. Starting again matters more than the gap. 🌱" : "Check-in saved. Small awareness is still progress. 🌿" });
  } catch (error) {
    return apiError(error);
  }
}
