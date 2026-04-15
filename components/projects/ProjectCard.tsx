import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";

type ProjectCategory = "volunteer" | "talent" | "teaching";

interface ProjectLike {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  alt?: string;
  sdgs: number[];
  startDate?: string | null;
  endDate?: string | null;
  city: string;
  category: ProjectCategory;
  isOpen: boolean;
}

interface ProjectCardProps {
  project: ProjectLike;
}

const categoryMeta: Record<
  ProjectCategory,
  {
    label: string;
    badgeClass: string;
    initial: string;
  }
> = {
  volunteer: {
    label: "Volunteer",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-100",
    initial: "V",
  },
  talent: {
    label: "Talent",
    badgeClass: "bg-cyan-50 text-cyan-700 border-cyan-100",
    initial: "T",
  },
  teaching: {
    label: "Teaching",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
    initial: "G",
  },
};

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate && !endDate) return "Dates to be confirmed";

  const format = (value?: string | null) => {
    if (!value) return "TBC";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "TBC";

    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return `${format(startDate)} - ${format(endDate)}`;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const meta = categoryMeta[project.category];

  return (
    <article className="group relative overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white shadow-[0_18px_50px_rgba(17,24,39,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(17,24,39,0.14)]">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <Image
          src={project.image}
          alt={project.alt || project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-[0.14]" aria-hidden="true">
          <span className="select-none text-7xl font-black text-white">
            {meta.initial}
          </span>
        </div>

        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${meta.badgeClass}`}>
            {meta.label}
          </span>

          <span
            className={
              project.isOpen
                ? "inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700"
                : "inline-flex rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500"
            }
          >
            {project.isOpen ? "Open" : "Closed"}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={14} aria-hidden="true" />
            {project.city}
          </span>

          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={14} aria-hidden="true" />
            {formatDateRange(project.startDate, project.endDate)}
          </span>
        </div>

        <h3 className="text-xl font-bold leading-tight text-gray-900">
          {project.title}
        </h3>

        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-gray-600">
          {project.description}
        </p>

        {project.sdgs?.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {project.sdgs.map((sdg) => (
              <span
                key={sdg}
                className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-600"
              >
                SDG {sdg}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}