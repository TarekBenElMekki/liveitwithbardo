import { safetyTips } from "@/data/lifestyle";

export function SafetySection() {
  return (
    <section aria-labelledby="safety-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Practical Info
          </p>
          <h2 id="safety-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Safety &amp; Daily Life
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Tunisia is generally safe for exchange participants. Here&apos;s what you need to know
            before you arrive.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {safetyTips.map((tip) => (
            <div
              key={tip.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">{tip.category}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{tip.tip}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
