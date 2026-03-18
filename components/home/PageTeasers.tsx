"use client";

import Link from "next/link";
import { ArrowRight, MapPin, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

// ─── Discover Bardo preview ───────────────────────────────────────────────────

function DiscoverPreview() {
  const stats = [
    { value: "1984", label: "Founded" },
    { value: "120+", label: "Countries" },
    { value: "50+",  label: "Partners" },
    { value: "1k+",  label: "Alumni" },
  ];

  const highlights = [
    { icon: "🏛️", label: "Rich Heritage" },
    { icon: "☀️", label: "Mediterranean" },
    { icon: "🤝", label: "Hospitality" },
  ];

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* Mini stat row */}
      <div className="grid grid-cols-4 divide-x divide-gray-100 rounded-xl border border-gray-100 bg-[var(--section-alt)] overflow-hidden">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-center py-3 px-1">
            <span className="text-sm font-bold text-accent tabular-nums leading-none">{s.value}</span>
            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider mt-1 leading-tight text-center">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Highlight chips */}
      <div className="flex flex-wrap gap-1.5">
        {highlights.map((h) => (
          <span
            key={h.label}
            className="inline-flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-100 rounded-full px-2.5 py-1"
          >
            <span aria-hidden="true">{h.icon}</span>
            {h.label}
          </span>
        ))}
      </div>

      {/* Journey hint */}
      <p className="text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
        6-step exchange journey · airport pickup · local buddy included
      </p>
    </div>
  );
}

// ─── Our Projects preview ─────────────────────────────────────────────────────

const categoryColors: Record<string, string> = {
  volunteer:  "bg-emerald-50 text-emerald-700",
  internship: "bg-blue-50 text-blue-700",
  cultural:   "bg-amber-50 text-amber-700",
};

function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

function MiniProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-[var(--section-alt)] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            "text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize",
            categoryColors[project.category] ?? "bg-gray-100 text-gray-500"
          )}
        >
          {project.category}
        </span>
        <span className="text-[10px] font-semibold text-white bg-accent rounded-full px-2 py-0.5">
          Open
        </span>
      </div>
      <p className="text-xs font-semibold text-gray-900 leading-snug line-clamp-1">{project.title}</p>
      <div className="flex items-center gap-3 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <MapPin size={9} aria-hidden="true" />
          {project.city}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={9} aria-hidden="true" />
          {formatShortDate(project.startDate)}
        </span>
      </div>
    </div>
  );
}

function ProjectsPreview() {
  const openProjects = projects.filter((p) => p.isOpen).slice(0, 2);

  return (
    <div className="mt-5 flex flex-col gap-3">
      {openProjects.map((p) => (
        <MiniProjectCard key={p.id} project={p} />
      ))}
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-3">
        {projects.filter((p) => p.isOpen).length} open opportunities · volunteer, internship &amp; cultural
      </p>
    </div>
  );
}

// ─── Tunisian Lifestyle preview ───────────────────────────────────────────────

function LifestylePreview() {
  const rows = [
    {
      icon: "💰",
      label: "Cost of Living",
      value: "~€270–420 / month",
    },
    {
      icon: "☀️",
      label: "Climate",
      value: "18–34°C · Mediterranean",
    },
    {
      icon: "🗣️",
      label: "Languages",
      value: "Arabic · French · English",
    },
  ];

  const topics = ["Food", "Transport", "Safety", "Packing"];

  return (
    <div className="mt-5 flex flex-col gap-4">
      {/* Info rows */}
      <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-100 bg-[var(--section-alt)] overflow-hidden">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 px-3 py-2.5">
            <span className="text-base leading-none flex-shrink-0" aria-hidden="true">{row.icon}</span>
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] font-semibold uppercase tracking-wider text-gray-400">{row.label}</span>
              <span className="text-xs text-gray-700 font-medium leading-snug">{row.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Topic chips */}
      <div className="flex flex-wrap gap-1.5">
        {topics.map((t) => (
          <span
            key={t}
            className="text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-2.5 py-1"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function PageTeasers() {
  const t = useTranslations("home");
  const pathname = usePathname();
  const segments = pathname.split("/");
  const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : "en") as Locale;
  const lp = (path: string) => `/${currentLocale}${path}`;

  const teasers = [
    {
      href: lp("/discover-bardo"),
      eyebrow: "The Place",
      title: t("discoverTitle"),
      cta: t("discoverCta"),
      preview: <DiscoverPreview />,
    },
    {
      href: lp("/our-projects"),
      eyebrow: "The Programs",
      title: t("projectsTitle"),
      cta: t("projectsCta"),
      preview: <ProjectsPreview />,
    },
    {
      href: lp("/tunisian-lifestyle"),
      eyebrow: "The Experience",
      title: t("lifestyleTitle"),
      cta: t("lifestyleCta"),
      preview: <LifestylePreview />,
    },
  ];

  return (
    <section aria-labelledby="teasers-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Explore
          </p>
          <h2
            id="teasers-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight"
          >
            {t("teasersHeading")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {teasers.map((teaser) => (
            <Link
              key={teaser.href}
              href={teaser.href}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-md transition-all duration-200 focus-ring"
            >
              {/* Card header */}
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                {teaser.eyebrow}
              </p>
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {teaser.title}
              </h3>

              {/* Visual preview area */}
              <div className="flex-1">
                {teaser.preview}
              </div>

              {/* CTA */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold">
                  {teaser.cta}
                  <ArrowRight
                    size={13}
                    className="group-hover:translate-x-1 transition-transform duration-150"
                    aria-hidden="true"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
