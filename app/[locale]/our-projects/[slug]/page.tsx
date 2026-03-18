import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "Project Details",
};

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("projects");

  return (
    <main id="main-content" className="page-top min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-6" aria-hidden="true">🚧</div>
        <h1 className="text-2xl font-bold text-white mb-3">{t("comingSoonTitle")}</h1>
        <p className="text-gray-400 text-sm mb-8">{t("comingSoonDesc")}</p>
        <Link
          href={`/${locale}/our-projects`}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
        >
          {t("backToProjects")}
        </Link>
      </div>
    </main>
  );
}
