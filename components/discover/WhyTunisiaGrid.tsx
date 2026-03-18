import { whyReasons } from "@/data/discover-bardo";

export function WhyTunisiaGrid() {
  return (
    <section aria-labelledby="why-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            The Destination
          </p>
          <h2 id="why-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Why Tunisia?
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Six real reasons why Tunisia stands out as an exchange destination.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {whyReasons.map((reason, i) => (
            <div
              key={reason.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl leading-none mt-0.5 flex-shrink-0" aria-hidden="true">{reason.icon}</span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-200 mb-1.5">
                    0{i + 1}
                  </p>
                  <h3 className="text-gray-900 font-semibold text-base mb-2 leading-snug">{reason.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{reason.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
