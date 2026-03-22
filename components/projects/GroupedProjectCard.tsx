import Link from "next/link";
import { MapPin, ArrowRight, Users, Calendar, ExternalLink } from "lucide-react";
import type { GroupedProject } from "@/lib/projects/grouped-types";
import { cn } from "@/lib/utils";

interface GroupedProjectCardProps {
  project: GroupedProject;
  locale: string;
}

const categoryColors: Record<string, string> = {
  volunteer:  "bg-emerald-50 text-emerald-700 border-emerald-100",
  internship: "bg-blue-50 text-blue-700 border-blue-100",
  cultural:   "bg-amber-50 text-amber-700 border-amber-100",
};

const categoryBg: Record<string, string> = {
  volunteer:  "from-emerald-50 to-emerald-100/60",
  internship: "from-blue-50 to-blue-100/60",
  cultural:   "from-amber-50 to-amber-100/60",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "TBC";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function GroupedProjectCard({ project, locale }: GroupedProjectCardProps) {
  const detailHref = `/${locale}/our-projects/${project.slug}`;
  const isGV = project.programme.toUpperCase() === "GV";

  const logisticsTags: string[] = [];
  if (project.logistics.accommodation) logisticsTags.push("Accommodation");
  if (project.logistics.food) logisticsTags.push("Meals");
  if (project.logistics.transport) logisticsTags.push("Transport");

  return (
    /**
     * Whole-card click pattern:
     * The card is a <article> with a block-level <Link> stretched to cover it.
     * Interactive elements inside (external CTA) use relative z-index to sit
     * above the card link and stop propagation is not needed — they are
     * separate stacking contexts via `relative z-10`.
     */
    <article className="relative rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
      {/* Full-card link — stretched to cover the entire card */}
      <Link
        href={detailHref}
        className="absolute inset-0 z-0 focus-ring rounded-2xl"
        aria-label={`View details for ${project.title}`}
        tabIndex={0}
      />

      {/* Header band */}
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
        {/* Status + programme chips */}
        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
          {project.programme && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-gray-600 border border-gray-200">
              {project.programme}
            </span>
          )}
          <span
            className={cn(
              "text-[10px] font-semibold px-2 py-0.5 rounded-full",
              project.isOpen
                ? "bg-accent text-white"
                : "bg-white/80 text-gray-400 border border-gray-200"
            )}
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="relative z-10 p-5 flex flex-col gap-3 flex-1 pointer-events-none">
        {/* Category + city */}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-0.5 rounded-full border capitalize",
              categoryColors[project.category] ?? "bg-gray-50 text-gray-500 border-gray-200"
            )}
          >
            {project.category}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <MapPin size={10} aria-hidden="true" />
            {project.city}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-gray-900 font-semibold text-base leading-snug">{project.title}</h3>

        {/* Availability */}
        {(project.totalAvailable != null || project.totalOpenings != null) && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <Users size={11} aria-hidden="true" />
            <span>
              {project.totalAvailable != null ? (
                <>
                  <span className="font-semibold text-gray-800">{project.totalAvailable}</span>
                  {project.totalOpenings != null && (
                    <span className="text-gray-400"> / {project.totalOpenings} slots</span>
                  )}
                  <span className="text-gray-400"> available</span>
                </>
              ) : (
                <span>{project.totalOpenings} slots</span>
              )}
            </span>
          </div>
        )}

        {/* Slots */}
        {project.slots.length > 0 && (
          <div className="flex flex-col gap-1 pt-1">
            <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Calendar size={9} aria-hidden="true" />
              {project.slots.length === 1 ? "Slot" : `${project.slots.length} Slots`}
            </span>
            <ul className="flex flex-col gap-1" aria-label="Available slots">
              {project.slots.slice(0, 3).map((slot, i) => (
                <li key={i} className="flex items-center justify-between text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5">
                  <span>
                    {slot.startDate || slot.endDate
                      ? <>{fmtDate(slot.startDate)} — {fmtDate(slot.endDate)}</>
                      : <span className="text-gray-400 italic">Dates to be confirmed</span>
                    }
                  </span>
                  {slot.openings != null && (
                    <span className="text-gray-400 tabular-nums ml-2 shrink-0">
                      {slot.openings} slots
                    </span>
                  )}
                </li>
              ))}
              {project.slots.length > 3 && (
                <li className="text-[10px] text-gray-400 px-3">
                  +{project.slots.length - 3} more slot{project.slots.length - 3 > 1 ? "s" : ""}
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Project Fee (EUR only) */}
        {project.fee.amount != null && project.fee.amount > 0 && (
          <p className="text-xs text-gray-500">
            Project Fee:{" "}
            <span className="font-semibold text-gray-700">
              €{project.fee.amount}
            </span>
          </p>
        )}

        {/* Logistics */}
        {logisticsTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {logisticsTags.map((tag) => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* SDGs */}
        {project.sdgs.length > 0 && (
          <div className="flex flex-wrap gap-1" aria-label="SDGs">
            {project.sdgs.map((sdg) => (
              <span key={sdg} className="text-[10px] px-2 py-0.5 rounded-full text-gray-400 border border-gray-100" title={`SDG ${sdg}`}>
                SDG {sdg}
              </span>
            ))}
          </div>
        )}

        {/* CTA row — pointer-events re-enabled for interactive elements */}
        <div className="pt-3 border-t border-gray-100 mt-auto flex items-center justify-between gap-3 pointer-events-auto">
          {/* "View details" — visual affordance; actual click handled by card link */}
          <span className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold" aria-hidden="true">
            View details
            <ArrowRight size={13} />
          </span>

          {/* External apply CTA — sits above the card link via z-10 */}
          {isGV && project.externalApplyUrl ? (
            <a
              href={project.externalApplyUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="relative z-20 inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-accent text-white hover:bg-[var(--accent-dark)] transition-colors focus-ring shrink-0"
              aria-label={`Apply for ${project.title} on AIESEC.org`}
            >
              Apply on aiesec.org
              <ExternalLink size={11} aria-hidden="true" />
            </a>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 cursor-not-allowed shrink-0"
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
