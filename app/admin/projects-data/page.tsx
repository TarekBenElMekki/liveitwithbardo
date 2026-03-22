import { notFound } from "next/navigation";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

/**
 * /admin/projects-data
 *
 * Protected admin page — staging only, requires valid session (enforced by middleware).
 * Shows raw GIS API opportunity rows alongside their transformed Project values.
 */
export default async function ProjectsDataPage() {
  if (process.env.APP_ENV !== "staging" && process.env.ENABLE_ADMIN !== "true") {
    notFound();
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);
  const isConfigured = !!process.env.AIESEC_GIS_TOKEN;

  return (
    <main className="min-h-screen bg-[var(--bg,#0a0a0a)] text-white p-8">
      <h1 className="text-2xl font-bold mb-2">Projects Data</h1>

      <p className="text-gray-400 text-sm mb-6">
        Source:{" "}
        {isConfigured ? (
          <span className="text-emerald-400">
            AIESEC GIS API — Bardo committee 1270 (GV/GT/GE)
          </span>
        ) : (
          <span className="text-yellow-400">
            AIESEC_GIS_TOKEN not set — no live data available
          </span>
        )}
      </p>

      {raw.length === 0 ? (
        <div className="flex flex-col gap-2 py-16 text-center">
          <p className="text-gray-500 text-lg">No opportunities loaded.</p>
          {!isConfigured && (
            <p className="text-gray-600 text-sm">
              Set <code className="text-yellow-400">AIESEC_GIS_TOKEN</code> to fetch live data.
            </p>
          )}
        </div>
      ) : (
        <>
          {/* Raw GIS rows */}
          <section className="mb-12">
            <h2 className="text-lg font-semibold mb-3">
              Raw GIS Opportunities ({raw.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                  <tr>
                    {["OPP ID", "Title", "Status", "Openings", "Available", "Start Date", "End Date", "Host LC", "Programme", "SDGs", "Accommodation", "Food", "Transport", "Fee"].map((col) => (
                      <th key={col} className="px-3 py-2 whitespace-nowrap border-b border-white/10">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raw.map((opp) => (
                    <tr key={opp.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.id}</td>
                      <td className="px-3 py-2 text-gray-300 max-w-[200px] truncate" title={opp.title}>{opp.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={opp.status === "open" ? "text-emerald-400" : "text-gray-500"}>
                          {opp.status ?? "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.openings ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.available_openings ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.earliest_start_date ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.latest_end_date ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[140px] truncate" title={opp.host_lc?.name}>{opp.host_lc?.name ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.programme?.short_name ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">{opp.sdg_info?.sdg_target?.goal_index ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">{opp.logistics_info?.accommodation_covered ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">{opp.logistics_info?.food_covered ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">{opp.logistics_info?.transportation_covered ?? "—"}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                        {opp.fee_and_health_insurance?.programme_fee
                          ? `${opp.fee_and_health_insurance.programme_fee} ${opp.fee_and_health_insurance.currency ?? ""}`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Transformed projects */}
          <section>
            <h2 className="text-lg font-semibold mb-3">
              Transformed Projects ({transformed.length})
            </h2>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="min-w-full text-xs text-left">
                <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                  <tr>
                    {["id", "slug", "title", "isOpen", "startDate", "endDate", "city", "category", "sdgs", "description"].map((col) => (
                      <th key={col} className="px-3 py-2 whitespace-nowrap border-b border-white/10">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transformed.map((p) => (
                    <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.id}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[160px] truncate" title={p.slug}>{p.slug}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[180px] truncate" title={p.title}>{p.title}</td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <span className={p.isOpen ? "text-emerald-400" : "text-gray-500"}>
                          {p.isOpen ? "open" : "closed"}
                        </span>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.startDate}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.endDate}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.city}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.category}</td>
                      <td className="px-3 py-2 whitespace-nowrap text-gray-400">{p.sdgs.join(", ") || "—"}</td>
                      <td className="px-3 py-2 text-gray-400 max-w-[240px] truncate" title={p.description}>{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
