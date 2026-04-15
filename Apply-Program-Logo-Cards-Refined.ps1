param(
  [string]$GtaLogoPath = "C:\Users\tarek\Downloads\GTA LOGO WHITE.png",
  [string]$GteLogoPath = "C:\Users\tarek\Downloads\GTE LOGO WHITE.png",
  [string]$GvLogoPath  = "C:\Users\tarek\Downloads\GV LOGO WHITE.png"
)

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

$selectorComponent = Join-Path $projectRoot 'components\projects\ProjectCategorySelector.tsx'
$publicProgramsDir = Join-Path $projectRoot 'public\programs'

Ensure-FileContains $selectorComponent

Write-Section "Copying new program logos"
$gtaDest = Join-Path $publicProgramsDir 'gta-logo-white.png'
$gteDest = Join-Path $publicProgramsDir 'gte-logo-white.png'
$gvDest  = Join-Path $publicProgramsDir 'gv-logo-white.png'

Copy-IfExists $GtaLogoPath $gtaDest
Copy-IfExists $GteLogoPath $gteDest
Copy-IfExists $GvLogoPath  $gvDest

Write-Section "Updating project selector cards with centered program logos"
$selectorContent = @'
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GroupedProject } from "@/lib/projects/grouped-types";

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
  surface: string;
  border: string;
  shadow: string;
  chip: string;
}

const COPY: Record<CategoryKey, Omit<CategoryCard, "key" | "href" | "count">> = {
  volunteer: {
    title: "Global Volunteer",
    subtitle: "Purpose-led experiences with communities, NGOs, and social impact missions.",
    image: "/programs/gv-logo-white.png",
    alt: "Global Volunteer logo",
    accent: "#F85A40",
    surface: "linear-gradient(180deg, #fdf2ef 0%, #fff7f5 100%)",
    border: "rgba(248, 90, 64, 0.18)",
    shadow: "rgba(248, 90, 64, 0.16)",
    chip: "rgba(248, 90, 64, 0.12)",
  },
  internship: {
    title: "Global Talent",
    subtitle: "Professional internships built for growth, leadership, and international exposure.",
    image: "/programs/gta-logo-white.png",
    alt: "Global Talent logo",
    accent: "#0CB9C1",
    surface: "linear-gradient(180deg, #eefbfc 0%, #f8feff 100%)",
    border: "rgba(12, 185, 193, 0.18)",
    shadow: "rgba(12, 185, 193, 0.16)",
    chip: "rgba(12, 185, 193, 0.12)",
  },
  cultural: {
    title: "Global Teacher",
    subtitle: "Teaching-driven exchange experiences focused on learning and cultural connection.",
    image: "/programs/gte-logo-white.png",
    alt: "Global Teacher logo",
    accent: "#F48924",
    surface: "linear-gradient(180deg, #fff5ea 0%, #fffaf4 100%)",
    border: "rgba(244, 137, 36, 0.18)",
    shadow: "rgba(244, 137, 36, 0.16)",
    chip: "rgba(244, 137, 36, 0.12)",
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
            Select the AIESEC experience you want to explore
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-500 max-w-2xl leading-relaxed">
            Each card starts muted and becomes fully branded on hover. Click to enter the real projects page.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <Link
              key={card.key}
              href={card.href}
              className="group relative isolate min-h-[32rem] sm:min-h-[36rem] overflow-hidden rounded-[2rem] border bg-white transition-all duration-300 ease-out hover:-translate-y-1 focus-ring"
              style={{
                borderColor: card.border,
                boxShadow: `0 16px 48px 0 ${card.shadow}`,
                background: card.surface,
              }}
            >
              <div
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `linear-gradient(180deg, ${card.accent} 0%, ${card.accent}dd 100%)`,
                }}
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(255,255,255,0.16)_48%,rgba(17,17,17,0.76)_100%)] group-hover:bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_38%,rgba(17,17,17,0.80)_100%)] transition-all duration-300" />

              <div className="relative z-10 flex h-full flex-col justify-between p-6 sm:p-8">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className="inline-flex rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-700 transition-colors duration-300 group-hover:text-white"
                    style={{ backgroundColor: card.chip }}
                  >
                    Program
                  </span>
                  <span className="inline-flex rounded-full border border-white/30 bg-black/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-700 transition-colors duration-300 group-hover:bg-black/20 group-hover:text-white">
                    {card.count} projects
                  </span>
                </div>

                <div className="relative flex-1 flex items-center justify-center py-6 sm:py-8">
                  <div className="relative h-[11rem] w-[11rem] sm:h-[13rem] sm:w-[13rem]">
                    <Image
                      src={card.image}
                      alt={card.alt}
                      fill
                      sizes="(max-width: 1024px) 200px, 220px"
                      className="object-contain opacity-75 grayscale brightness-[0.84] saturate-0 transition duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:saturate-100 group-hover:brightness-100"
                      priority={false}
                    />
                  </div>
                </div>

                <div className="relative">
                  <div
                    className="mb-4 h-1 w-14 rounded-full transition-all duration-300 group-hover:w-24"
                    style={{ backgroundColor: card.accent }}
                  />
                  <h3 className="text-gray-900 group-hover:text-white text-3xl sm:text-[2.05rem] font-bold leading-[1.05] transition-colors duration-300 max-w-xs">
                    {card.title}
                  </h3>
                  <p className="mt-4 text-gray-600 group-hover:text-white/86 text-sm sm:text-base leading-relaxed transition-colors duration-300 max-w-sm">
                    {card.subtitle}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:text-white transition-colors duration-300">
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
Write-Host "Updated the project cards with smaller centered logos and the new aligned colors." -ForegroundColor Green
Write-Host ""
Write-Host "Run:" -ForegroundColor Cyan
Write-Host "  powershell -ExecutionPolicy Bypass -File .\Apply-Program-Logo-Cards-Refined.ps1" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Optional custom paths:" -ForegroundColor Cyan
Write-Host '  powershell -ExecutionPolicy Bypass -File .\Apply-Program-Logo-Cards-Refined.ps1 -GtaLogoPath "C:\path\to\GTA LOGO WHITE.png" -GteLogoPath "C:\path\to\GTE LOGO WHITE.png" -GvLogoPath "C:\path\to\GV LOGO WHITE.png"' -ForegroundColor White
