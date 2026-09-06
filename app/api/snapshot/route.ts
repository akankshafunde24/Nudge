import { NextResponse } from "next/server";
import { loadSnapshot } from "@/lib/server/snapshot";
import { apiError } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const month = new URL(request.url).searchParams.get("month") || undefined;
    const result = await loadSnapshot(month);
    return NextResponse.json(result);
  } catch (error) {
    return apiError(error);
  }
}
