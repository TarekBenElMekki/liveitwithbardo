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
  volunteer:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  internship: "bg-blue-50 text-blue-700 border-blue-100",
  cultural:   "bg-amber-50 text-amber-700 border-amber-100",
};

function SlotRow({ slot, index }: { slot: ProjectSlot; index: number }) {
  const hasDate = slot.startDate || slot.endDate;
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
      <div className="flex items-center gap-2 text-sm text-gray-700">
        <Calendar size={13} className="text-gray-400 shrink-0" aria-hidden="true" />
        {hasDate ? (
          <span>
            <span className="font-medium">{fmtDate(slot.startDate)}</span>
            <span className="text-gray-400 mx-1">—</span>
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

  const isGV = project.programme.toUpperCase() === "GV";
  const applyUrl = project.externalApplyUrl;

  return (
    <main id="main-content" className="page-top min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* Back link */}
        <Link
          href={`/${locale}/our-projects`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10 focus-ring rounded-md"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          {t("backToProjects")}
        </Link>

        {/* Header */}
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

        {/* Description */}
        <p className="text-gray-600 leading-relaxed mb-10">{project.description}</p>

        {/* Stats row */}
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
                €{project.fee.amount}
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

        {/* SDGs */}
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

        {/* Slots */}
        {project.slots.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Available Slots ({project.slots.length})
            </p>
            <div className="flex flex-col gap-2">
              {project.slots.map((slot, i) => (
                <SlotRow key={i} slot={slot} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Apply CTA */}
        <div className="pt-6 border-t border-gray-100">
          {isGV && applyUrl ? (
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
          {!isGV && (
            <p className="text-xs text-gray-400 mt-2">
              Online applications for {project.programme || "this programme"} are not available here yet. Contact AIESEC in Bardo directly.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
