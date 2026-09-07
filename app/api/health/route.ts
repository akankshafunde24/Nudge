import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    ok: true,
    app: "Nudge",
    version: "1.0.0",
    time: new Date().toISOString(),
    config: {
      googleClientId: Boolean(process.env.GOOGLE_CLIENT_ID),
      googleClientSecret: Boolean(process.env.GOOGLE_CLIENT_SECRET),
      authSecret: Boolean(process.env.AUTH_SECRET),
      allowedEmail: Boolean(process.env.ALLOWED_EMAIL),
      geminiApiKey: Boolean(process.env.GEMINI_API_KEY)
    }
  });
}
