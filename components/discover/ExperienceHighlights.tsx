import { experienceHighlights } from "@/data/discover-bardo";

export function ExperienceHighlights() {
  return (
    <section aria-labelledby="highlights-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Testimonials
          </p>
          <h2 id="highlights-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            In their own words
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Experiences from past participants across different programs and cities.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {experienceHighlights.map((h) => (
            <figure
              key={h.id}
              className="rounded-2xl border border-gray-100 bg-white p-7 flex flex-col gap-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <blockquote className="text-gray-700 text-base leading-relaxed flex-1">
                <span className="text-accent/40 text-4xl font-serif leading-none block mb-2" aria-hidden="true">&ldquo;</span>
                {h.quote}
              </blockquote>
              <figcaption className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div className="w-9 h-9 rounded-full bg-accent/8 flex items-center justify-center text-accent text-sm font-bold flex-shrink-0" aria-hidden="true">
                  {h.author.charAt(0)}
                </div>
                <div>
                  <p className="text-gray-900 font-semibold text-sm">{h.author}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{h.country} · {h.program}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
