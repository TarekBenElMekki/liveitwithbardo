import { transportOptions } from "@/data/lifestyle";

export function TransportSection() {
  return (
    <section aria-labelledby="transport-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Getting Around
          </p>
          <h2 id="transport-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Transport in Tunisia
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            A range of affordable options. Here&apos;s what you&apos;ll actually use day-to-day.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {transportOptions.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-3 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl leading-none" aria-hidden="true">{t.icon}</span>
                <h3 className="text-gray-900 font-semibold text-base">{t.name}</h3>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{t.description}</p>
              <div className="pt-3 border-t border-gray-100 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-accent">Avg cost: {t.avgCost}</span>
                <span className="text-xs text-gray-400 leading-relaxed">💡 {t.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
