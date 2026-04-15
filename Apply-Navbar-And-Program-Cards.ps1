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

function Copy-IfExists($source, $destination) {
  if (-not (Test-Path -LiteralPath $source)) {
    throw "Image not found: $source"
  }
  $dir = Split-Path -Parent $destination
  if ($dir -and -not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }
  Copy-Item -LiteralPath $source -Destination $destination -Force
  Write-Host "[copied] $source -> $destination" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$appGlobals = Join-Path $projectRoot 'app\globals.css'
$navbarFile = Join-Path $projectRoot 'components\layout\Navbar.tsx'
$selectorComponent = Join-Path $projectRoot 'components\projects\ProjectCategorySelector.tsx'
$publicProgramsDir = Join-Path $projectRoot 'public\programs'

Ensure-FileContains $appGlobals
Ensure-FileContains $navbarFile
Ensure-FileContains $selectorComponent

Write-Section "Copying program card images into public/programs"
$gvSource  = 'C:\Users\tarek\Downloads\GV VERTICAL WHITE.png'
$gtaSource = 'C:\Users\tarek\Downloads\GTA VERTICAL WHITE.png'
$gteSource = 'C:\Users\tarek\Downloads\GTE VERTICAL WHITE.png'

$gvDest  = Join-Path $publicProgramsDir 'gv-vertical-white.png'
$gtaDest = Join-Path $publicProgramsDir 'gta-vertical-white.png'
$gteDest = Join-Path $publicProgramsDir 'gte-vertical-white.png'

Copy-IfExists $gvSource $gvDest
Copy-IfExists $gtaSource $gtaDest
Copy-IfExists $gteSource $gteDest

Write-Section "Updating global layout spacing"
$appGlobalsContent = @'
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --accent: #ff3131;
  --accent-dark: #cc0000;
  --red: #ff3131;
  --bg: #ffffff;
  --fg: #111111;
  --card-bg: #ffffff;
  --border: #ebebeb;
  --muted: #6b7280;
  --section-alt: #f7f7f7;
  --text-eyebrow: 0.6875rem;
  --tracking-eyebrow: 0.12em;
  --nav-h: 5rem;
  --header-h: var(--nav-h);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--bg);
  color: var(--fg);
  font-family: var(--font-inter), system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: url("/hero/bg.png");
  background-repeat: repeat;
  background-size: auto;
  opacity: 0.06;
  pointer-events: none;
}

.focus-ring {
  @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white;
}

.text-accent {
  color: var(--accent);
}

.bg-accent\/8 {
  background-color: rgba(255, 49, 49, 0.08);
}

.page-top {
  padding-top: var(--header-h);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: var(--bg);
}
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 3px;
}

input[type="range"] {
  accent-color: var(--accent);
}

[dir="rtl"] .group-hover\:translate-x-1:hover {
  --tw-translate-x: -0.25rem;
}

[dir="rtl"] body {
  font-feature-settings: "kern" 1;
}

[dir="rtl"] .rotate-180 {
  transform: rotate(180deg);
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
'@
Write-TextFile $appGlobals $appGlobalsContent

Write-Section "Making navbar taller and removing old promo offset"
$navbarContent = @'
"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Globe } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { locales, localeNames, type Locale } from "@/i18n/config";

export function Navbar({ isProduction = false }: { isProduction?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  const segments = pathname.split("/");
  const currentLocale = (locales.includes(segments[1] as Locale) ? segments[1] : "en") as Locale;

  const localePath = (path: string) => `/${currentLocale}${path}`;

  const allNavLinks = [
    { href: localePath(""), label: t("home"), productionVisible: true },
    { href: localePath("/discover-bardo"), label: t("discover"), productionVisible: false },
    { href: localePath("/our-projects"), label: t("projects"), productionVisible: true },
    { href: localePath("/tunisian-lifestyle"), label: t("lifestyle"), productionVisible: false },
    { href: localePath("/faq"), label: t("faq"), productionVisible: false },
  ];

  const navLinks = isProduction
    ? allNavLinks.filter((l) => l.productionVisible)
    : allNavLinks;

  const isActive = (href: string) => {
    const base = `/${currentLocale}`;
    if (href === base || href === `${base}/`) return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  };

  const openPicker = useCallback(() => {
    window.dispatchEvent(new Event("open-language-picker"));
    setMenuOpen(false);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link
            href={localePath("")}
            className="flex items-center gap-3 focus-ring rounded-md"
            aria-label={t("logoLabel")}
          >
            <img src="/logos/aiesec-human-blue.svg" alt="" aria-hidden="true" className="h-10 w-auto" />
            <span className="text-gray-900 font-semibold text-[1.05rem] tracking-tight">in Bardo</span>
          </Link>

          <nav aria-label={t("mainNav")} className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-base transition-colors duration-150 focus-ring rounded-md px-4 py-2",
                  isActive(link.href)
                    ? "text-gray-900 font-medium"
                    : "text-gray-500 hover:text-gray-900"
                )}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}

            <button
              type="button"
              onClick={openPicker}
              aria-label={t("changeLanguageLabel")}
              title={t("changeLanguage")}
              className="flex items-center gap-2 text-base text-gray-500 hover:text-gray-900 transition-colors focus-ring rounded-md px-4 py-2 ml-1"
            >
              <Globe size={16} aria-hidden="true" />
              <span className="uppercase text-sm font-semibold tracking-wide">{currentLocale}</span>
            </button>

            <Link
              href={localePath("/our-projects")}
              className="ml-4 px-6 py-3 rounded-full bg-accent text-white text-base font-semibold hover:bg-[var(--accent-dark)] transition-colors duration-150 focus-ring"
            >
              {t("applyNow")}
            </Link>
          </nav>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 focus-ring"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label={t("mobileNav")}
          className="md:hidden bg-white border-t border-gray-100"
        >
          <ul className="flex flex-col px-4 py-4 gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "block py-3 text-base transition-colors focus-ring rounded-md px-2",
                    isActive(link.href)
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-900"
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 border-t border-gray-100 mt-2">
              <div className="flex gap-2 py-1">
                {locales.map((loc) => (
                  <Link
                    key={loc}
                    href={`/${loc}${pathname.substring(currentLocale.length + 1)}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex-1 text-center py-2 rounded-lg text-sm font-semibold border transition-colors focus-ring",
                      loc === currentLocale
                        ? "bg-accent text-white border-accent"
                        : "text-gray-500 border-gray-200 hover:text-gray-900"
                    )}
                  >
                    {localeNames[loc]}
                  </Link>
                ))}
              </div>
            </li>
            <li className="pt-3 pb-1">
              <Link
                href={localePath("/our-projects")}
                onClick={() => setMenuOpen(false)}
                className="block text-center px-4 py-3 rounded-full bg-accent text-white text-base font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
              >
                {t("applyNow")}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
'@
Write-TextFile $navbarFile $navbarContent

Write-Section "Updating project selector cards with GV / GTA / GTE images"
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
  accent: string;
  glow: string;
  surface: string;
}

const COPY: Record<CategoryKey, Omit<CategoryCard, "key" | "href" | "count">> = {
  volunteer: {
    title: "Global Volunteer",
    subtitle: "Purpose-led experiences with NGOs, communities, and social impact projects.",
    image: "/programs/gv-vertical-white.png",
    alt: "Global Volunteer",
    accent: "#F15A29",
    glow: "rgba(241, 90, 41, 0.32)",
    surface: "linear-gradient(180deg, #f15a29 0%, #9c2c0a 100%)",
  },
  internship: {
    title: "Global Talent",
    subtitle: "Professional internships built for growth, leadership, and international exposure.",
    image: "/programs/gta-vertical-white.png",
    alt: "Global Talent",
    accent: "#0077C8",
    glow: "rgba(0, 119, 200, 0.30)",
    surface: "linear-gradient(180deg, #0077c8 0%, #003d73 100%)",
  },
  cultural: {
    title: "Global Teacher",
    subtitle: "Teaching-driven exchange experiences designed around learning and cultural connection.",
    image: "/programs/gte-vertical-white.png",
    alt: "Global Teacher",
    accent: "#7FBA27",
    glow: "rgba(127, 186, 39, 0.30)",
    surface: "linear-gradient(180deg, #7fba27 0%, #456a10 100%)",
  },
};

function buildCard(
  key: CategoryKey,
  projects: GroupedProject[],
  locale: string
): CategoryCard {
  return {
    key,
    href: `/${locale}/our-projects?category=${key}`,
    count: projects.filter((project) => project.category === key).length,
    ...COPY[key],
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
      className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-14">
          <p className="text-accent text-xs font-semibold uppercase tracking-[0.22em] mb-4">
            Choose your path
          </p>
          <h2
            id="project-selector-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight max-w-4xl"
          >
            Select the AIESEC experience you want to enter
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            The cards begin in a muted state. Hover to reveal the program color, then click to enter the real projects page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group relative isolate min-h-[34rem] sm:min-h-[40rem] overflow-hidden rounded-[2rem] border border-gray-200 bg-[#f4f4f4] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-transparent focus-ring"
              style={{
                boxShadow: `0 20px 60px 0 rgba(17, 17, 17, 0.08)`,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: card.surface }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.24)_42%,rgba(0,0,0,0.7)_100%)]" />
              <div
                className="absolute inset-x-[16%] top-[18%] bottom-[20%] rounded-full blur-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundColor: card.glow }}
              />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-white/70 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-700 backdrop-blur group-hover:text-gray-900">
                    Program
                  </span>
                  <span className="inline-flex rounded-full border border-white/60 bg-black/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    {card.count} projects
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center">
                  <div className="relative h-full w-full">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 90vw, 32vw"
                      className="object-contain scale-[1.08] grayscale brightness-[0.82] saturate-0 transition duration-300 ease-out group-hover:grayscale-0 group-hover:saturate-100 group-hover:brightness-100 group-hover:scale-[1.12]"
                      priority={false}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="mb-3 h-1 w-16 rounded-full bg-white/70 transition-all duration-300 group-hover:w-24" />
                  <h3 className="text-white text-3xl sm:text-[2.2rem] font-bold leading-[1.05] max-w-xs">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-white/85 text-sm sm:text-base leading-relaxed max-w-sm">
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

Write-Section "Done"
Write-Host "Navbar spacing fixed and project selector cards now use the GV / GTA / GTE vertical white images." -ForegroundColor Green
Write-Host ""
Write-Host "Run:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File .\\Apply-Navbar-And-Program-Cards.ps1" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
