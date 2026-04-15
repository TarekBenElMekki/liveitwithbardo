param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-File($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    throw "Missing file: $path"
  }
}

function Write-File($path, $content) {
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[updated] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$root = (Get-Location).Path
Write-Host "[root] $root" -ForegroundColor Green

$page = Join-Path $root 'app\admin\projects-data\page.tsx'
Ensure-File $page

Write-Section "Writing improved readable admin projects UI"

$content = @'
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Database, Table2, ArrowLeft, Layers3 } from "lucide-react";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

function SectionHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-5">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {action}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "success" | "accent";
}) {
  const toneClass =
    tone === "success"
      ? "text-emerald-400"
      : tone === "accent"
      ? "text-cyan-300"
      : "text-white";

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-[0_10px_30px_rgba(0,0,0,0.22)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </p>
      <p className={`mt-3 text-3xl font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

function DataShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/75 shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
      {children}
    </div>
  );
}

export default async function ProjectsDataPage() {
  if (process.env.APP_ENV === "production" || process.env.APP_ENV === undefined) {
    notFound();
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);
  const activeTransformed = transformed.filter((p) => p.isOpen);
  const isConfigured = !!process.env.AIESEC_GIS_TOKEN;

  const programmeById = new Map(
    raw.map((opp) => [String(opp.id), opp.programme?.short_name ?? "—"])
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_45%,#020617_100%)] text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-[1650px] mx-auto">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 backdrop-blur-xl shadow-[0_20px_80px_rgba(0,0,0,0.35)] overflow-hidden mb-8">
          <div className="border-b border-white/10 px-6 py-6 sm:px-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
                  <Layers3 size={13} aria-hidden="true" />
                  GIS / EXPA Debug
                </div>
                <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-white">
                  Projects Data Console
                </h1>
                <p className="mt-3 max-w-3xl text-sm sm:text-base leading-relaxed text-slate-300">
                  Inspect the raw GIS payload coming from EXPA/GIS, compare it with the transformed project
                  objects used by the site, and export the active transformed rows to CSV.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="/api/admin/projects-data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                >
                  <Database size={15} aria-hidden="true" />
                  Open JSON API
                </a>

                <a
                  href="/api/admin/projects-data/export"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] transition-colors"
                >
                  <Download size={15} aria-hidden="true" />
                  Export active CSV
                </a>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-6 sm:px-8">
            <StatCard
              label="Source"
              value={isConfigured ? "Live GIS / EXPA API" : "Fallback / no live token"}
              tone="accent"
            />
            <StatCard label="Raw rows" value={raw.length} />
            <StatCard label="Active transformed rows" value={activeTransformed.length} tone="success" />
          </div>
        </div>

        {raw.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-950/75 p-10 text-center shadow-[0_18px_60px_rgba(0,0,0,0.28)]">
            <p className="text-xl font-semibold text-white mb-2">No opportunities loaded.</p>
            {!isConfigured && (
              <p className="text-sm text-slate-400">
                Set <code className="text-yellow-300">AIESEC_GIS_TOKEN</code> to fetch live data.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <section>
              <SectionHeader
                title={`Raw GIS Opportunities (${raw.length})`}
                description="Direct payload values before site transformation."
              />

              <DataShell>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10">
                      <tr className="text-left">
                        {[
                          "OPP ID",
                          "Title",
                          "Status",
                          "Programme",
                          "Openings",
                          "Available",
                          "Start Date",
                          "End Date",
                          "Host LC",
                          "SDGs",
                          "Accommodation",
                          "Food",
                          "Transport",
                          "Fee",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {raw.map((opp, index) => (
                        <tr
                          key={opp.id}
                          className={`border-b border-white/5 ${
                            index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                          } hover:bg-cyan-400/[0.06] transition-colors`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-slate-200">{opp.id}</td>
                          <td className="px-4 py-3 min-w-[260px] text-slate-100 font-medium">{opp.title}</td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={
                                opp.status === "open"
                                  ? "inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                                  : "inline-flex rounded-full bg-slate-700/50 px-2.5 py-1 text-xs font-semibold text-slate-300"
                              }
                            >
                              {opp.status ?? "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-cyan-300 font-semibold">
                            {opp.programme?.short_name ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{opp.openings ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{opp.available_openings ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{opp.earliest_start_date ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{opp.latest_end_date ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{opp.host_lc?.name ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                            {opp.sdg_info?.sdg_target?.goal_index ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                            {opp.logistics_info?.accommodation_covered ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                            {opp.logistics_info?.food_covered ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                            {opp.logistics_info?.transportation_covered ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">
                            {opp.fee_and_health_insurance?.programme_fee
                              ? `${opp.fee_and_health_insurance.programme_fee} ${opp.fee_and_health_insurance.currency ?? ""}`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataShell>
            </section>

            <section>
              <SectionHeader
                title={`Active Transformed Projects (${activeTransformed.length})`}
                description="These are the transformed rows currently eligible for the public site and CSV export."
                action={
                  <a
                    href="/api/admin/projects-data/export"
                    className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-colors"
                  >
                    <Table2 size={15} aria-hidden="true" />
                    Download CSV
                  </a>
                }
              />

              <DataShell>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10">
                      <tr className="text-left">
                        {[
                          "ID",
                          "Slug",
                          "Title",
                          "Programme",
                          "Status",
                          "Start Date",
                          "End Date",
                          "City",
                          "Category",
                          "SDGs",
                          "Description",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activeTransformed.map((p, index) => (
                        <tr
                          key={p.id}
                          className={`border-b border-white/5 ${
                            index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                          } hover:bg-emerald-400/[0.06] transition-colors`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-slate-200">{p.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.slug}</td>
                          <td className="px-4 py-3 min-w-[220px] text-slate-100 font-medium">{p.title}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-cyan-300 font-semibold">
                            {programmeById.get(String(p.id)) ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                              {p.isOpen ? "open" : "closed"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.startDate ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.endDate ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.city ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.category ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.sdgs.join(", ") || "—"}</td>
                          <td className="px-4 py-3 min-w-[320px] text-slate-300">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataShell>
            </section>

            <section>
              <SectionHeader
                title={`All Transformed Projects (${transformed.length})`}
                description="Includes active and inactive transformed rows."
              />

              <DataShell>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-white/10">
                      <tr className="text-left">
                        {[
                          "ID",
                          "Slug",
                          "Title",
                          "Programme",
                          "Status",
                          "Start Date",
                          "End Date",
                          "City",
                          "Category",
                          "SDGs",
                          "Description",
                        ].map((col) => (
                          <th
                            key={col}
                            className="px-4 py-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 whitespace-nowrap"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {transformed.map((p, index) => (
                        <tr
                          key={p.id}
                          className={`border-b border-white/5 ${
                            index % 2 === 0 ? "bg-white/[0.02]" : "bg-transparent"
                          } hover:bg-indigo-400/[0.06] transition-colors`}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-slate-200">{p.id}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.slug}</td>
                          <td className="px-4 py-3 min-w-[220px] text-slate-100 font-medium">{p.title}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-cyan-300 font-semibold">
                            {programmeById.get(String(p.id)) ?? "—"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={
                                p.isOpen
                                  ? "inline-flex rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-300"
                                  : "inline-flex rounded-full bg-slate-700/50 px-2.5 py-1 text-xs font-semibold text-slate-300"
                              }
                            >
                              {p.isOpen ? "open" : "closed"}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.startDate ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.endDate ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.city ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.category ?? "—"}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-300">{p.sdgs.join(", ") || "—"}</td>
                          <td className="px-4 py-3 min-w-[320px] text-slate-300">{p.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DataShell>
            </section>
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-white/10 transition-colors"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            Back to admin
          </Link>
        </div>
      </div>
    </main>
  );
}
'@

Write-File $page $content

Write-Section "Done"
Write-Host "Admin projects data page redesigned for readability." -ForegroundColor Green
Write-Host ""
Write-Host "Run next:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
