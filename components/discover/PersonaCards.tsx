import { personas } from "@/data/discover-bardo";

export function PersonaCards() {
  return (
    <section aria-labelledby="personas-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Who Joins
          </p>
          <h2 id="personas-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Who is this for?
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            AIESEC in Bardo welcomes participants from all backgrounds.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="rounded-2xl border border-gray-100 bg-white p-7 flex flex-col gap-4 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full bg-accent/8 flex items-center justify-center flex-shrink-0" aria-hidden="true">
                <span className="text-accent font-bold text-base">{persona.title.charAt(0)}</span>
              </div>
              <h3 className="text-gray-900 font-bold text-lg leading-snug">{persona.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{persona.description}</p>
              <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-100">
                {persona.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full text-gray-500 bg-gray-50 border border-gray-100"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
