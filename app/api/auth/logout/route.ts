import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/session";

/** POST /api/auth/logout — clears the session cookie. */
export async function POST() {
  if (process.env.APP_ENV !== "staging") {
    return new NextResponse(null, { status: 404 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
