import { packingItems } from "@/data/lifestyle";

export function PackingSection() {
  const grouped = packingItems.reduce<Record<string, typeof packingItems>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return (
    <section aria-labelledby="packing-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Preparation
          </p>
          <h2 id="packing-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            What to Pack
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            A practical checklist for your Tunisia exchange.
            Essential items are marked — the rest is nice to have.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="rounded-2xl border border-gray-100 bg-white p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 text-sm">
                    <span
                      className={`mt-0.5 flex-shrink-0 text-xs leading-none ${item.essential ? "text-accent" : "text-gray-300"}`}
                      aria-hidden="true"
                    >
                      {item.essential ? "★" : "○"}
                    </span>
                    <span className={item.essential ? "text-gray-800" : "text-gray-400"}>
                      {item.item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-6">★ Essential &nbsp;·&nbsp; ○ Nice to have</p>
      </div>
    </section>
  );
}
