import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { FaqPageClient } from "@/components/faq/FaqPageClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("faq");
  return {
    title: t("metaTitle"),
    description: t("metaDesc"),
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faq");

  return (
    <main id="main-content" className="page-top">
      <section
        aria-labelledby="faq-hero-heading"
        className="relative py-24 px-4 overflow-hidden bg-[var(--section-alt)]"
      >
        <div className="relative max-w-3xl mx-auto">
          <p className="text-accent text-xs font-semibold uppercase tracking-widest mb-4">
            {t("badge")}
          </p>
          <h1
            id="faq-hero-heading"
            className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4"
          >
            {t("heroHeading")}{" "}
            <span className="text-accent">{t("heroAccent")}</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
        </div>
      </section>

      <FaqPageClient />

      <section
        aria-labelledby="faq-handoff-heading"
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-gray-100"
      >
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">Still have questions?</p>
            <h2 id="faq-handoff-heading" className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
              {t("handoffHeading")}
            </h2>
            <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{t("handoffDesc")}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
            <a
              href="mailto:aiesec.tn@aiesec.net"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
            >
              {t("emailUs")}
            </a>
            <a
              href="https://instagram.com/aiesec_tunisia"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors duration-150 focus-ring"
            >
              {t("instagramHandle")}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
