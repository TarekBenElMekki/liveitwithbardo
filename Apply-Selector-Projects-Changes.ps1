param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-FileContains($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Required file not found: $path"
  }
}

function Write-TextFile($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$homePage = Join-Path $projectRoot 'app\[locale]\page.tsx'
$localeLayout = Join-Path $projectRoot 'app\[locale]\layout.tsx'
$projectsClient = Join-Path $projectRoot 'components\projects\ProjectsPageClient.tsx'
$selectorComponent = Join-Path $projectRoot 'components\projects\ProjectCategorySelector.tsx'

Ensure-FileContains $homePage
Ensure-FileContains $localeLayout
Ensure-FileContains $projectsClient

Write-Section "Removing homepage popup overlay"
$homePageContent = @'
import { HeroSection } from "@/components/sections/HeroSection";
import { StatsSection } from "@/components/sections/StatsSection";
import { GlobeSection } from "@/components/globe/GlobeSection";
import { CtaSection } from "@/components/sections/CtaSection";

export default function HomePage() {
  return (
    <main id="main-content">
      <HeroSection />
      <StatsSection />
      <GlobeSection />
      <CtaSection />
    </main>
  );
}
'@
Write-TextFile $homePage $homePageContent

Write-Section "Removing red promo bar from locale layout"
$layoutContent = @'
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatAgent } from "@/components/chat/ChatAgent";
import { CountryLanguagePicker } from "@/components/onboarding/CountryLanguagePicker";
import { locales, type Locale } from "@/i18n/config";
import { appUrl, showChatAgent, showProductionNav } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Live it With AIESEC in Bardo",
    template: "%s | Live it With AIESEC in Bardo",
  },
  description:
    "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
  keywords: ["AIESEC", "Bardo", "Tunisia", "exchange", "cultural exchange", "internship", "volunteer"],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Live it With AIESEC in Bardo",
    description: "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
    type: "website",
    url: appUrl,
    siteName: "Live it With AIESEC in Bardo",
    images: [
      {
        url: "/hero/hero_static_default.png",
        width: 1200,
        height: 630,
        alt: "Live it With AIESEC in Bardo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live it With AIESEC in Bardo",
    description: "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
    images: ["/hero/hero_static_default.png"],
  },
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Navbar isProduction={showProductionNav} />
      {children}
      <Footer />
      {showChatAgent && <ChatAgent />}
      <CountryLanguagePicker />
    </NextIntlClientProvider>
  );
}
'@
Write-TextFile $localeLayout $layoutContent

Write-Section "Creating cinematic projects selection screen"
$selectorContent = @'
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { cn } from "@/lib/utils";

interface ProjectCategorySelectorProps {
  projects: GroupedProject[];
  locale: string;
}

type CategoryKey = "volunteer" | "internship" | "cultural";

interface CategoryCard {
  key: CategoryKey;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  alt: string;
  count: number;
}

const FALLBACK_IMAGES: Record<CategoryKey, string> = {
  volunteer: "/hero/main-1.png",
  internship: "/hero/main-2.png",
  cultural: "/hero/main-3.png",
};

const COPY: Record<CategoryKey, { title: string; subtitle: string }> = {
  volunteer: {
    title: "Volunteer",
    subtitle: "Community-driven missions with direct local impact.",
  },
  internship: {
    title: "Internship",
    subtitle: "Professional experiences built around growth and leadership.",
  },
  cultural: {
    title: "Cultural",
    subtitle: "Shorter discovery-led exchanges focused on immersion.",
  },
};

function buildCard(
  key: CategoryKey,
  projects: GroupedProject[],
  locale: string
): CategoryCard {
  const first = projects.find((project) => project.category === key);
  return {
    key,
    title: COPY[key].title,
    subtitle: COPY[key].subtitle,
    href: `/${locale}/our-projects?category=${key}`,
    image: first?.image || FALLBACK_IMAGES[key],
    alt: first?.alt || COPY[key].title,
    count: projects.filter((project) => project.category === key).length,
  };
}

export function ProjectCategorySelector({
  projects,
  locale,
}: ProjectCategorySelectorProps) {
  const cards = [
    buildCard("volunteer", projects, locale),
    buildCard("internship", projects, locale),
    buildCard("cultural", projects, locale),
  ];

  return (
    <section
      aria-labelledby="project-selector-heading"
      className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-12">
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em] mb-4">
            Choose your path
          </p>
          <h2
            id="project-selector-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-3xl"
          >
            Select the type of experience you want to explore
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            Start with one track. Each card opens the actual projects page already focused on that category.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className={cn(
                "group relative min-h-[30rem] sm:min-h-[34rem] overflow-hidden rounded-[2rem] border border-gray-200",
                "bg-[linear-gradient(180deg,#f3f4f6_0%,#e5e7eb_100%)]",
                "transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10 hover:border-gray-300",
                "focus-ring"
              )}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-transparent to-black/65 transition-opacity duration-300 group-hover:opacity-80" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7)_0%,rgba(255,255,255,0)_60%)] opacity-70 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-700 backdrop-blur">
                    {card.title}
                  </span>
                  <span className="inline-flex rounded-full border border-white/60 bg-black/35 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    {card.count} projects
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center py-8">
                  <div className="relative h-[18rem] w-full max-w-[18rem] sm:h-[21rem] sm:max-w-[21rem]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 80vw, 30vw"
                      className="object-contain grayscale brightness-[0.92] saturate-0 transition duration-300 ease-out group-hover:grayscale-0 group-hover:saturate-100 group-hover:brightness-100"
                    />
                  </div>
                </div>

                <div className="relative">
                  <p className="text-white/75 text-xs font-semibold uppercase tracking-[0.22em] mb-3">
                    Explore category
                  </p>
                  <h3 className="text-white text-3xl sm:text-[2rem] font-bold leading-tight">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-white/80 text-sm sm:text-base leading-relaxed max-w-sm">
                    {card.subtitle}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-white text-sm font-semibold">
                    Enter projects
                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
'@
Write-TextFile $selectorComponent $selectorContent

Write-Section "Replacing projects client with selector-first flow"
$projectsClientContent = @'
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { ProjectFilters } from "./ProjectFilters";
import { GroupedProjectGrid } from "./GroupedProjectGrid";
import { ProjectCategorySelector } from "./ProjectCategorySelector";
import { filterProjects, type FilterState } from "@/lib/utils";
import type { SDG } from "@/data/projects";

const DEFAULT_FILTERS: FilterState = {
  category: "all",
  sdgs: [],
  city: "all",
  status: "all",
  startDate: "",
  endDate: "",
};

interface ProjectsPageClientProps {
  projects: GroupedProject[];
  locale: string;
}

function normalizeCategory(value: string | null): FilterState["category"] | null {
  if (value === "volunteer" || value === "internship" || value === "cultural") {
    return value;
  }
  return null;
}

export function ProjectsPageClient({ projects, locale }: ProjectsPageClientProps) {
  const searchParams = useSearchParams();
  const selectedCategory = normalizeCategory(searchParams.get("category"));
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  useEffect(() => {
    if (selectedCategory) {
      setFilters({
        ...DEFAULT_FILTERS,
        category: selectedCategory,
      });
    } else {
      setFilters(DEFAULT_FILTERS);
    }
  }, [selectedCategory]);

  const availableSdgs = useMemo(
    () =>
      Array.from(new Set(projects.flatMap((project) => project.sdgs))).sort(
        (a, b) => a - b
      ) as SDG[],
    [projects]
  );

  const filtered = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters]
  );

  const resetHref = `/${locale}/our-projects`;

  if (!selectedCategory) {
    return <ProjectCategorySelector projects={projects} locale={locale} />;
  }

  return (
    <section aria-label="Projects listing" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em] mb-3">
              Category selected
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight capitalize">
              {selectedCategory} projects
            </h2>
            <p className="mt-3 text-gray-500 text-sm sm:text-base max-w-2xl leading-relaxed">
              The filter bar below is still active, so you can refine this category further.
            </p>
          </div>

          <a
            href={resetHref}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors focus-ring"
          >
            Back to selection
          </a>
        </div>

        <ProjectFilters
          filters={filters}
          availableSdgs={availableSdgs}
          onChange={setFilters}
        />

        <p className="text-xs text-gray-400 font-medium tabular-nums">
          {filtered.length} project{filtered.length === 1 ? "" : "s"} found
        </p>

        <GroupedProjectGrid
          projects={filtered}
          locale={locale}
          onReset={() => setFilters({ ...DEFAULT_FILTERS, category: selectedCategory })}
        />
      </div>
    </section>
  );
}
'@
Write-TextFile $projectsClient $projectsClientContent

Write-Section "Done"
Write-Host "Created selector-first projects flow and removed the homepage popup + top promo bar." -ForegroundColor Green
Write-Host ""
Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
