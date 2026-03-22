import { MapPin, Calendar, ArrowRight } from "lucide-react";
import type { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
}

const categoryColors: Record<string, string> = {
  volunteer:   "bg-emerald-50 text-emerald-700 border-emerald-100",
  internship:  "bg-blue-50 text-blue-700 border-blue-100",
  cultural:    "bg-amber-50 text-amber-700 border-amber-100",
};

const categoryBg: Record<string, string> = {
  volunteer:  "from-emerald-50 to-emerald-100/60",
  internship: "from-blue-50 to-blue-100/60",
  cultural:   "from-amber-50 to-amber-100/60",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric" });
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="rounded-2xl border border-gray-100 bg-white overflow-hidden flex flex-col hover:border-gray-200 hover:shadow-md transition-all duration-200 group">
      {/* Image area */}
      <div
        className={cn(
          "relative aspect-video w-full bg-gradient-to-br flex items-end overflow-hidden",
          categoryBg[project.category] ?? "from-gray-50 to-gray-100"
        )}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-20" aria-hidden="true">
          <span className="text-7xl font-black text-gray-400 select-none">
            {project.category === "volunteer" ? "V" : project.category === "internship" ? "I" : "C"}
          </span>
        </div>
        {/* Status chip */}
        <div className="absolute top-3 right-3">
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full",
              project.isOpen
                ? "bg-accent text-white"
                : "bg-white/80 text-gray-400 border border-gray-200"
            )}
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-3 flex-1">
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

        <h3 className="text-gray-900 font-semibold text-base leading-snug">{project.title}</h3>

        <p className="text-gray-500 text-sm leading-relaxed flex-1 line-clamp-3">
          {project.description}
        </p>

        <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
          <Calendar size={10} aria-hidden="true" />
          <span>{formatDate(project.startDate)} — {formatDate(project.endDate)}</span>
        </div>

        {project.sdgs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1" aria-label="Sustainable Development Goals">
            {project.sdgs.map((sdg) => (
              <span
                key={sdg}
                className="text-[10px] font-medium px-2 py-0.5 rounded-full text-gray-400 border border-gray-100"
                title={`SDG ${sdg}`}
              >
                SDG {sdg}
              </span>
            ))}
          </div>
        )}

        {project.isOpen && (
          <div className="pt-3 border-t border-gray-100 mt-auto">
            <a
              href="https://aiesec.org"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-accent text-sm font-semibold hover:gap-2.5 transition-all duration-150 focus-ring rounded-md"
            >
              Apply now
              <ArrowRight size={13} aria-hidden="true" />
            </a>
          </div>
        )}
      </div>
    </article>
  );
}
