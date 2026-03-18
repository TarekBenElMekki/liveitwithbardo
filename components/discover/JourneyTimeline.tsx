import { journeySteps } from "@/data/discover-bardo";

export function JourneyTimeline() {
  return (
    <section aria-labelledby="journey-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            The Process
          </p>
          <h2 id="journey-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Your Exchange Journey
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            From your first click to your last day — here&apos;s what the process looks like.
          </p>
        </div>
        <ol className="relative border-l border-gray-100 flex flex-col">
          {journeySteps.map((step) => (
            <li key={step.id} className="ml-8 pb-10 last:pb-0">
              <span
                className="absolute -left-3.5 flex items-center justify-center w-7 h-7 rounded-full bg-accent text-white text-xs font-bold ring-4 ring-white"
                aria-hidden="true"
              >
                {step.step}
              </span>
              <div className="pt-0.5">
                <h3 className="text-gray-900 font-semibold text-base mb-2 leading-snug">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
