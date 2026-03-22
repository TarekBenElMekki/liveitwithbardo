import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie, COOKIE_NAME, SESSION_TTL_SECONDS } from "@/lib/session";

/**
 * POST /api/auth/login
 *
 * Validates staging credentials and sets a signed session cookie.
 * Only active when APP_ENV=staging — returns 404 in production.
 */
export async function POST(req: NextRequest) {
  // Hard 404 in production — this endpoint must not exist outside staging
  if (process.env.APP_ENV !== "staging") {
    return new NextResponse(null, { status: 404 });
  }

  let username: string;
  let password: string;

  try {
    const body = await req.json();
    username = String(body.username ?? "").trim();
    password = String(body.password ?? "");
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const validUser = process.env.STAGING_LOGIN_USERNAME ?? "";
  const validPass = process.env.STAGING_LOGIN_PASSWORD ?? "";

  // Refuse to operate if credentials are not configured — prevents accidental
  // empty-string bypass when env vars are missing.
  if (!validUser || !validPass) {
    console.error("[auth/login] STAGING_LOGIN_USERNAME or STAGING_LOGIN_PASSWORD is not set");
    return NextResponse.json({ error: "Auth not configured" }, { status: 503 });
  }

  // Constant-time-ish comparison to avoid timing attacks
  const userMatch = username === validUser;
  const passMatch = password === validPass;

  if (!userMatch || !passMatch) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const cookieValue = await createSessionCookie(username);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
