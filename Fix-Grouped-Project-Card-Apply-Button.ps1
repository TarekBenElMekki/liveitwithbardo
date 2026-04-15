param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-Directory($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Write-Utf8NoBom($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir) { Ensure-Directory $dir }
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$groupedCardPath = Join-Path $projectRoot 'components\projects\GroupedProjectCard.tsx'

Write-Section "Rewriting GroupedProjectCard.tsx to show Apply on list cards for all programmes"
$groupedCardContent = @'
import Link from "next/link";
import { MapPin, ArrowRight, Users, Calendar, ExternalLink } from "lucide-react";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { cn } from "@/lib/utils";

interface GroupedProjectCardProps {
  project: GroupedProject;
  locale: string;
}

const categoryColors: Record<string, string> = {
  volunteer: "bg-emerald-50 text-emerald-700 border-emerald-100",
  talent: "bg-cyan-50 text-cyan-700 border-cyan-100",
  teaching: "bg-amber-50 text-amber-700 border-amber-100",
};

const categoryBg: Record<string, string> = {
  volunteer: "from-emerald-50 to-emerald-100/60",
  talent: "from-cyan-50 to-cyan-100/60",
  teaching: "from-amber-50 to-amber-100/60",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "TBC";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function GroupedProjectCard({ project, locale }: GroupedProjectCardProps) {
  const detailHref = `/${locale}/our-projects/${project.slug}`;
  const applyUrl = project.externalApplyUrl;

  const logisticsTags: string[] = [];
  if (project.logistics.accommodation) logisticsTags.push("Accommodation");
  if (project.logistics.food) logisticsTags.push("Meals");
  if (project.logistics.transport) logisticsTags.push("Transport");

  return (
    <article className="relative rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 focus-ring rounded-2xl"
        aria-label={`View details for ${project.title}`}
        tabIndex={0}
      />

      <div
        className={cn(
          "relative h-24 w-full bg-gradient-to-br flex items-end overflow-hidden px-5 pb-4",
          categoryBg[project.category] ?? "from-gray-50 to-gray-100"
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-10" aria-hidden="true">
          <span className="text-8xl font-black text-gray-400 select-none">
            {project.programme || project.category[0].toUpperCase()}
          </span>
        </div>

        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-full border capitalize backdrop-blur-sm bg-white/80",
              categoryColors[project.category] ?? "bg-gray-50 text-gray-600 border-gray-200"
            )}
          >
            {project.category}
          </span>

          {project.programme && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/80 text-gray-700 border border-white/70 backdrop-blur-sm">
              {project.programme}
            </span>
          )}

          <span
            className={cn(
              "text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm",
              project.isOpen
                ? "bg-accent text-white"
                : "bg-white/80 text-gray-500 border border-white/70"
            )}
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-4 p-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 leading-tight">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed line-clamp-3">
            {project.description}
          </p>
        </div>

        <div className="flex flex-col gap-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <MapPin size={14} className="shrink-0" aria-hidden="true" />
            <span>{project.city || "Location TBC"}</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar size={14} className="shrink-0" aria-hidden="true" />
            <span>
              {fmtDate(project.startDate || null)} — {fmtDate(project.endDate || null)}
            </span>
          </div>

          {project.availableSlots > 0 && (
            <div className="flex items-center gap-2">
              <Users size={14} className="shrink-0" aria-hidden="true" />
              <span>{project.availableSlots} available slot{project.availableSlots === 1 ? "" : "s"}</span>
            </div>
          )}
        </div>

        {project.sdgs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.sdgs.map((sdg) => (
              <span
                key={sdg}
                className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 bg-gray-50"
                title={`SDG ${sdg}`}
              >
                SDG {sdg}
              </span>
            ))}
          </div>
        )}

        {logisticsTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {logisticsTags.map((tag) => (
              <span
                key={tag}
                className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center gap-3">
          <Link
            href={detailHref}
            className="relative z-10 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-accent transition-colors"
          >
            View details
            <ArrowRight size={14} aria-hidden="true" />
          </Link>

          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-accent text-white text-xs font-semibold hover:bg-[var(--accent-dark)] transition-colors shrink-0"
              aria-label={`Apply on AIESEC.org for ${project.title}`}
              title="Apply on AIESEC.org"
            >
              Apply on aiesec.org
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          ) : (
            <span
              className="relative z-10 inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed shrink-0"
              aria-label="Apply not available for this programme"
              title={`Apply via AIESEC for ${project.programme || "this programme"} — not available here`}
            >
              Apply on aiesec.org
              <ExternalLink size={11} aria-hidden="true" />
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
'@

Write-Utf8NoBom $groupedCardPath $groupedCardContent

Write-Section "Done"
Write-Host "The list cards on /our-projects now show the Apply button for any programme that has externalApplyUrl." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White