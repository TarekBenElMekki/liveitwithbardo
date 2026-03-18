/**
 * IGV Bardo Team section.
 * Presents the Incoming Global Volunteer team behind the exchange programme.
 * Placeholder member data — replace with real names/roles when available.
 */

const teamMembers = [
  {
    id: "role-vp",
    role: "VP Incoming Global Volunteer",
    responsibility: "Leads the IGV programme strategy and partner relations",
    initial: "V",
  },
  {
    id: "role-coord-1",
    role: "Exchange Coordinator",
    responsibility: "Manages participant matching, onboarding, and host communication",
    initial: "E",
  },
  {
    id: "role-coord-2",
    role: "Exchange Coordinator",
    responsibility: "Supports participants throughout their exchange journey",
    initial: "E",
  },
  {
    id: "role-buddy",
    role: "Local Buddy Lead",
    responsibility: "Coordinates the buddy programme and cultural integration activities",
    initial: "L",
  },
];

const supportPillars = [
  { icon: "🛬", label: "Airport Pickup" },
  { icon: "🏠", label: "Housing Guidance" },
  { icon: "🗺️", label: "City Orientation" },
  { icon: "📞", label: "24/7 Support" },
];

export function IgvTeamSection() {
  return (
    <section
      id="igv-team"
      aria-labelledby="igv-team-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            The Team
          </p>
          <h2
            id="igv-team-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Meet the IGV Bardo Team
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            A dedicated team of AIESEC members in Bardo coordinates every step of your
            exchange — from your first application to your last day in Tunisia.
          </p>
        </div>

        {/* Team member cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4"
            >
              {/* Avatar placeholder */}
              <div
                className="w-12 h-12 rounded-full bg-accent/8 flex items-center justify-center flex-shrink-0"
                aria-hidden="true"
              >
                <span className="text-accent font-bold text-lg">{member.initial}</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <p className="text-gray-900 font-semibold text-sm leading-snug">{member.role}</p>
                <p className="text-gray-400 text-xs leading-relaxed">{member.responsibility}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Support pillars */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-5">
            What we provide
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {supportPillars.map((pillar) => (
              <div key={pillar.label} className="flex items-center gap-3">
                <span className="text-xl leading-none flex-shrink-0" aria-hidden="true">
                  {pillar.icon}
                </span>
                <span className="text-sm text-gray-700 font-medium">{pillar.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
