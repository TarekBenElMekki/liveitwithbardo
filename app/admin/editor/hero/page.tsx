import { notFound } from "next/navigation";

/**
 * /admin/editor/hero
 *
 * Protected admin page — only reachable in staging with a valid session.
 * The middleware handles the redirect-to-login and 404-in-production guards,
 * so by the time this renders the user is authenticated.
 */
export default function HeroEditorPage() {
  // Double-guard: middleware already blocks this, but belt-and-suspenders
  // in case the page is somehow rendered outside the middleware path.
  if (process.env.APP_ENV !== "staging" && process.env.ENABLE_ADMIN !== "true") {
    notFound();
  }

  return (
    <main
      id="admin-hero-editor"
      className="min-h-screen bg-[var(--bg,#0a0a0a)] text-white p-8"
    >
      <h1 className="text-2xl font-bold mb-4">Hero Editor</h1>
      <p className="text-gray-400 text-sm">
        Admin content — staging only. Configure the hero section here.
      </p>
    </main>
  );
}
