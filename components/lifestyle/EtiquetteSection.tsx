import { etiquetteTips } from "@/data/lifestyle";

export function EtiquetteSection() {
  const dos   = etiquetteTips.filter((t) => t.type === "do");
  const donts = etiquetteTips.filter((t) => t.type === "dont");

  return (
    <section aria-labelledby="etiquette-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Cultural Awareness
          </p>
          <h2 id="etiquette-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Local Etiquette
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Tunisia is a Muslim-majority country with a secular constitution and a cosmopolitan culture.
            A little awareness goes a long way.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-5">Do</p>
            <ul className="flex flex-col gap-3.5">
              {dos.map((tip) => (
                <li key={tip.id} className="text-sm text-gray-600 leading-relaxed flex items-start gap-3">
                  <span className="w-4 h-4 rounded-full bg-accent/8 text-accent flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" aria-hidden="true">✓</span>
                  {tip.tip}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-5">Don&apos;t</p>
            <ul className="flex flex-col gap-3.5">
              {donts.map((tip) => (
                <li key={tip.id} className="text-sm text-gray-600 leading-relaxed flex items-start gap-3">
                  <span className="w-4 h-4 rounded-full bg-red-50 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" aria-hidden="true">✕</span>
                  {tip.tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
