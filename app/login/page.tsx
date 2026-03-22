import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifySessionCookie, COOKIE_NAME } from "@/lib/session";
import { LoginForm } from "./LoginForm";

/**
 * /login — staging-only login page.
 * Returns 404 in production. Skips login if session is already valid.
 */

/** Returns true only for safe same-origin relative paths (rejects //evil.com). */
function isSafePath(path: string | undefined): path is string {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  if (process.env.APP_ENV !== "staging") {
    notFound();
  }

  // Already authenticated → skip login
  const cookieStore = await cookies();
  const sessionValue = cookieStore.get(COOKIE_NAME)?.value;
  if (sessionValue) {
    const session = await verifySessionCookie(sessionValue);
    if (session) {
      const { next } = await searchParams;
      redirect(isSafePath(next) ? next : "/en");
    }
  }

  const { next } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg,#0a0a0a)] px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-white text-2xl font-bold mb-2 text-center">Staging Login</h1>
        <p className="text-gray-400 text-sm text-center mb-8">
          This environment is restricted to authorised users.
        </p>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
