import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/server/snapshot";
import { explainSnapshot } from "@/lib/server/ai";
import { apiError, readJson } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    const body = await readJson<{ question?: string; month?: string }>(request);
    const { snapshot } = await loadSnapshot(body.month);
    const answer = await explainSnapshot(String(body.question || "How am I doing this month?").slice(0, 500), snapshot.finance, snapshot.previousFinance, snapshot.growth);
    return NextResponse.json({ answer, source: process.env.GEMINI_API_KEY ? "ai-with-rule-fallback" : "rule-based" });
  } catch (error) { return apiError(error); }
}
