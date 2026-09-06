import { NextResponse } from "next/server";
import { setDemoSession } from "@/lib/server/auth";

export async function GET(request: Request) {
  await setDemoSession();
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
