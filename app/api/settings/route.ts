import { NextResponse } from "next/server";
import { dataContext } from "@/lib/server/context";
import { apiError, readJson } from "@/lib/server/http";
import { shareWithServiceAccountIfConfigured, upsertSetting } from "@/lib/server/sheets";
import { investorProfile, type InvestorAnswers } from "@/lib/core/investor";
import { optionalEnv } from "@/lib/server/env";

interface SettingsBody {
  display_name?: string;
  currency?: string;
  monthly_income_target?: number;
  essential_expenses?: number;
  monthly_investment_target?: number;
  primary_goal?: string;
  horizon?: InvestorAnswers["horizon"];
  volatilityComfort?: InvestorAnswers["volatilityComfort"];
  priority?: InvestorAnswers["priority"];
  onboarding_complete?: boolean;
  reshareAutomation?: boolean;
}

export async function GET() {
  try {
    const ctx = await dataContext();
    return NextResponse.json({
      aiConfigured: Boolean(optionalEnv("GEMINI_API_KEY")),
      automationBridgeConfigured: Boolean(optionalEnv("GOOGLE_SERVICE_ACCOUNT_JSON_B64")),
      spreadsheetUrl: ctx.session.spreadsheetUrl,
      demo: ctx.demo
    });
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const body = await readJson<SettingsBody>(request);
    const ctx = await dataContext();
    if (body.reshareAutomation) {
      if (!ctx.demo) await shareWithServiceAccountIfConfigured(ctx.session.accessToken, ctx.sheetId);
      return NextResponse.json({ ok: true, automationShared: Boolean(optionalEnv("GOOGLE_SERVICE_ACCOUNT_JSON_B64")) && !ctx.demo });
    }
    const entries: Array<[string, string]> = [];
    if (body.display_name != null) entries.push(["display_name", String(body.display_name).trim()]);
    if (body.currency != null) entries.push(["currency", String(body.currency).trim().toUpperCase()||"INR"]);
    if (body.monthly_income_target != null) entries.push(["monthly_income_target", String(Math.max(0, Number(body.monthly_income_target)))]);
    if (body.essential_expenses != null) entries.push(["essential_expenses", String(Math.max(0, Number(body.essential_expenses)))]);
    if (body.monthly_investment_target != null) entries.push(["monthly_investment_target", String(Math.max(0, Number(body.monthly_investment_target)))]);
    if (body.primary_goal != null) entries.push(["primary_goal", String(body.primary_goal).trim().slice(0,120)]);
    if (body.horizon && body.volatilityComfort && body.priority) {
      const profile = investorProfile({ horizon: body.horizon, volatilityComfort: body.volatilityComfort, priority: body.priority });
      entries.push(["investor_profile", profile.name], ["risk_comfort", profile.risk], ["investment_horizon", body.horizon], ["investor_volatility", body.volatilityComfort], ["investor_priority", body.priority]);
    }
    if (body.onboarding_complete) entries.push(["onboarding_complete", "true"]);
    if (!ctx.demo) for (const [key, value] of entries) await upsertSetting(ctx.session.accessToken, ctx.sheetId, key, value);
    return NextResponse.json({ ok: true, settings: Object.fromEntries(entries), spreadsheetUrl: ctx.session.spreadsheetUrl });
  } catch (error) { return apiError(error); }
}
