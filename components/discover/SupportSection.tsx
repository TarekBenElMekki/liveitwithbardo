const beforeArrival = [
  "Pre-departure briefing with your AIESEC Tunisia contact",
  "Practical arrival guide: accommodation options, SIM cards, transport",
  "Visa guidance and invitation letter from host organisation",
  "Introduction to your local buddy before you land",
  "24/7 emergency contact number provided before departure",
];

const duringExchange = [
  "Airport pickup on arrival day",
  "Orientation session in your first week",
  "Local buddy for your first month",
  "Regular check-ins with your AIESEC coordinator",
  "Cultural events, day trips, and social gatherings throughout",
  "Support with any administrative issues (housing, health, etc.)",
];

export function SupportSection() {
  return (
    <section aria-labelledby="support-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Support
          </p>
          <h2 id="support-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            You&apos;re not alone
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            AIESEC in Bardo supports you before you arrive and throughout your entire exchange.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-gray-100 bg-white p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-5">Before Arrival</p>
            <ul className="flex flex-col gap-3.5">
              {beforeArrival.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-accent/8 text-accent flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-7">
            <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-5">During Your Exchange</p>
            <ul className="flex flex-col gap-3.5">
              {duringExchange.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 leading-relaxed">
                  <span className="w-4 h-4 rounded-full bg-accent/8 text-accent flex items-center justify-center flex-shrink-0 mt-0.5 text-[9px] font-bold" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
