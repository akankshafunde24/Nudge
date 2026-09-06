import { NextResponse } from "next/server";
import { createOAuthState, createPkce, googleAuthorizeUrl, storeOAuthTransient } from "@/lib/server/auth";
import { apiError } from "@/lib/server/http";

export async function GET(request: Request) {
  try {
    const origin = new URL(request.url).origin;
    const state = createOAuthState();
    const { verifier, challenge } = createPkce();
    await storeOAuthTransient(state, verifier);
    return NextResponse.redirect(googleAuthorizeUrl(origin, state, challenge));
  } catch (error) {
    return apiError(error);
  }
}
