"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "framer-motion";
import type { Project } from "@/data/projects";
import { ProjectCard } from "./ProjectCard";

interface ProjectGridProps {
  projects: Project[];
  onReset: () => void;
}

export function ProjectGrid({ projects, onReset }: ProjectGridProps) {
  const reducedMotion = useReducedMotion();

  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <div className="text-5xl" aria-hidden="true">🔍</div>
        <h3 className="text-gray-900 font-semibold text-xl">No projects found</h3>
        <p className="text-gray-500 text-sm max-w-sm">
          No projects match your current filters. Try adjusting or clearing them.
        </p>
        <button
          type="button"
          onClick={onReset}
          className="mt-2 px-5 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-[var(--accent-dark)] transition-colors focus-ring"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      aria-live="polite"
      aria-label={`${projects.length} project${projects.length === 1 ? "" : "s"} found`}
    >
      {projects.map((project, i) => (
        <motion.div
          key={project.id}
          initial={reducedMotion ? {} : { opacity: 0, y: 24 }}
          animate={reducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.05 }}
        >
          <ProjectCard project={project} />
        </motion.div>
      ))}
    </div>
  );
}
