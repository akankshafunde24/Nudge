import { NextResponse } from "next/server";
import { clearOAuthTransient, exchangeGoogleCode, fetchGoogleProfile, isAllowedEmail, readOAuthTransient, setSession } from "@/lib/server/auth";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;
  const error = url.searchParams.get("error");
  if (error) return NextResponse.redirect(`${origin}/?auth_error=${encodeURIComponent(error)}`);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const transient = await readOAuthTransient();
  if (!code || !state || state !== transient.state || !transient.verifier) {
    await clearOAuthTransient();
    return NextResponse.redirect(`${origin}/?auth_error=invalid_oauth_state`);
  }
  try {
    const tokens = await exchangeGoogleCode(origin, code, transient.verifier);
    const profile = await fetchGoogleProfile(tokens.access_token);
    if (!isAllowedEmail(profile.email)) {
      await clearOAuthTransient();
      return NextResponse.redirect(`${origin}/?auth_error=account_not_allowed`);
    }
    await setSession({
      email: profile.email,
      name: profile.name || profile.email.split("@")[0],
      picture: profile.picture,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000
    });
    await clearOAuthTransient();
    return NextResponse.redirect(`${origin}/setup`);
  } catch (e) {
    console.error(e);
    await clearOAuthTransient();
    return NextResponse.redirect(`${origin}/?auth_error=google_signin_failed`);
  }
}
