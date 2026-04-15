param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
    Write-Host ""
    Write-Host ("=" * 72) -ForegroundColor DarkGray
    Write-Host $title -ForegroundColor Cyan
    Write-Host ("=" * 72) -ForegroundColor DarkGray
}

function Ensure-Directory($path) {
    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}

function Write-Utf8NoBom($path, $content) {
    $dir = Split-Path -Parent $path
    if ($dir) { Ensure-Directory $dir }
    [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
    Write-Host ("[written] " + $path) -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host ("[root] " + $projectRoot) -ForegroundColor Green

$groupedCardPath = Join-Path $projectRoot 'components\projects\GroupedProjectCard.tsx'
$slugPagePath = Join-Path $projectRoot 'app\[locale]\our-projects\[slug]\page.tsx'

Write-Section "Restoring GroupedProjectCard.tsx"
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
              {fmtDate(project.startDate || null)} - {fmtDate(project.endDate || null)}
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
              title={`Apply via AIESEC for ${project.programme || "this programme"} - not available here`}
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

Write-Section "Restoring slug page"
$slugPageContent = @'
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, MapPin, Users, Calendar, ExternalLink } from "lucide-react";
import { loadGroupedProjects } from "@/lib/projects/loader";
import type { GroupedProject, ProjectSlot } from "@/lib/projects/grouped-types";
import { cn } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await loadGroupedProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description.slice(0, 160),
  };
}

function fmtDate(iso: string | null): string {
  if (!iso) return "TBC";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const categoryColors: Record<string, string> = {
  volunteer: "bg-emerald-50 text-emerald-700 border-emerald-100",
  talent: "bg-cyan-50 text-cyan-700 border-cyan-100",
  teaching: "bg-amber-50 text-amber-700 border-amber-100",
};

function SlotRow({ slot }: { slot: ProjectSlot }) {
  const hasDate = slot.startDate || slot.endDate;

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
        {hasDate ? (
          <span>
            <span className="font-medium">{fmtDate(slot.startDate)}</span>
            <span className="text-gray-400 mx-1">-</span>
            <span className="font-medium">{fmtDate(slot.endDate)}</span>
          </span>
        ) : (
          <span className="text-gray-400 italic">Dates to be confirmed</span>
        )}
      </div>

      {slot.openings != null && (
        <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
          <Users size={11} aria-hidden="true" />
          <span>{slot.openings} slots</span>
        </div>
      )}
    </div>
  );
}

export default async function ProjectSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const [t, projects] = await Promise.all([
    getTranslations("projects"),
    loadGroupedProjects(),
  ]);

  const project: GroupedProject | undefined = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const logisticsTags: string[] = [];
  if (project.logistics.accommodation) logisticsTags.push("Accommodation");
  if (project.logistics.food) logisticsTags.push("Meals");
  if (project.logistics.transport) logisticsTags.push("Transport");

  const applyUrl = project.externalApplyUrl;

  return (
    <main id="main-content" className="page-top min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <Link
          href={`/${locale}/our-projects`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 focus-ring rounded-md"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t("backToProjects")}
        </Link>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize",
              categoryColors[project.category] ?? "bg-gray-50 text-gray-500 border-gray-200"
            )}
          >
            {project.category}
          </span>

          {project.programme && (
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">
              {project.programme}
            </span>
          )}

          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full",
              project.isOpen
                ? "bg-accent text-white"
                : "bg-gray-100 text-gray-400 border border-gray-200"
            )}
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-3">
          {project.title}
        </h1>

        <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-8">
          <MapPin size={13} aria-hidden="true" />
          {project.city}
        </div>

        <p className="text-gray-600 leading-relaxed mb-10">{project.description}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {project.availableSlots > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Availability</p>
              <p className="text-lg font-bold text-gray-900">{project.availableSlots}</p>
              <p className="text-xs text-gray-400">slots available</p>
            </div>
          )}

          {project.fee.amount != null && project.fee.amount > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Project Fee</p>
              <p className="text-lg font-bold text-gray-900">
                EUR {project.fee.amount}
                <span className="text-sm font-normal text-gray-400 ml-1">EUR</span>
              </p>
            </div>
          )}

          {logisticsTags.length > 0 && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Included</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {logisticsTags.map((tag) => (
                  <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {project.sdgs.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">SDGs</p>
            <div className="flex flex-wrap gap-1.5">
              {project.sdgs.map((sdg) => (
                <span key={sdg} className="text-xs px-2.5 py-1 rounded-full text-gray-500 border border-gray-200" title={`SDG ${sdg}`}>
                  SDG {sdg}
                </span>
              ))}
            </div>
          </div>
        )}

        {project.slots.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Available Slots ({project.slots.length})
            </p>
            <div className="flex flex-col gap-2">
              {project.slots.map((slot, i) => (
                <SlotRow key={i} slot={slot} />
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 border-t border-gray-100">
          {applyUrl ? (
            <a
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
            >
              Apply on AIESEC.org
              <ExternalLink size={14} aria-hidden="true" />
            </a>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold cursor-not-allowed"
              title={`Apply via AIESEC for ${project.programme || "this programme"}`}
            >
              Apply on AIESEC.org
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          )}

          {!applyUrl && (
            <p className="text-xs text-gray-400 mt-2">
              Online applications are not available here yet. Contact AIESEC in Bardo directly.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
'@
Write-Utf8NoBom $slugPagePath $slugPageContent

Write-Section "Done"
Write-Host "Both project files were restored with a plain hyphen date separator." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White