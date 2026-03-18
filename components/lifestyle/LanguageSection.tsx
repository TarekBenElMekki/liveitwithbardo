import { languagePhrases } from "@/data/lifestyle";
import type { LanguagePhrase } from "@/data/lifestyle";

const categoryLabels: Record<LanguagePhrase["category"], string> = {
  greeting:  "Greetings",
  practical: "Practical",
  food:      "Food & Dining",
  emergency: "Emergency",
};

const categories = (["greeting", "practical", "food", "emergency"] as const);

export function LanguageSection() {
  return (
    <section aria-labelledby="language-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Communication
          </p>
          <h2 id="language-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Language Basics
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Arabic is the official language, French is widely spoken. A few key phrases go a long way.
          </p>
        </div>
        <div className="flex flex-col gap-10">
          {categories.map((cat) => {
            const phrases = languagePhrases.filter((p) => p.category === cat);
            if (phrases.length === 0) return null;
            return (
              <div key={cat}>
                <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
                  {categoryLabels[cat]}
                </p>
                <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50">
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5 w-1/4">English</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5 w-1/3">Arabic</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5 w-1/4">French</th>
                        <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider py-3 px-5 w-1/6">Pronunciation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {phrases.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-5 text-gray-900 font-medium">{p.english}</td>
                          <td className="py-3 px-5 text-gray-600">{p.arabic}</td>
                          <td className="py-3 px-5 text-gray-600">{p.french}</td>
                          <td className="py-3 px-5 text-gray-400 text-xs italic">{p.pronunciation ?? "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
