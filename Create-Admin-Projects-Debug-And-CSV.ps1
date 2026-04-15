param()

$ErrorActionPreference = "Stop"

function Write-Section($title) {
  Write-Host ""
  Write-Host ("=" * 78) -ForegroundColor DarkGray
  Write-Host $title -ForegroundColor Cyan
  Write-Host ("=" * 78) -ForegroundColor DarkGray
}

function Ensure-Directory($path) {
  if (-not (Test-Path -LiteralPath $path)) {
    New-Item -ItemType Directory -Path $path -Force | Out-Null
  }
}

function Write-TextFile($path, $content) {
  $dir = Split-Path -Parent $path
  if ($dir) { Ensure-Directory $dir }
  [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
  Write-Host "[written] $path" -ForegroundColor Green
}

Write-Section "Resolving project root"
$projectRoot = (Get-Location).Path
Write-Host "[root] $projectRoot" -ForegroundColor Green

$pagePath = Join-Path $projectRoot 'app\admin\projects-data\page.tsx'
$routePath = Join-Path $projectRoot 'app\api\admin\projects-data\export\route.ts'

Write-Section "Writing enhanced admin projects data page"
$pageContent = @'
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Database, Table2 } from "lucide-react";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

/**
 * /admin/projects-data
 *
 * Internal admin page — accessible directly in staging/development.
 * Blocked (404) in production by middleware.
 * Shows raw GIS API opportunity rows, transformed rows, and a CSV export
 * for the active transformed projects currently shown.
 */
export default async function ProjectsDataPage() {
  if (process.env.APP_ENV === "production" || process.env.APP_ENV === undefined) {
    notFound();
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);
  const activeTransformed = transformed.filter((p) => p.isOpen);
  const isConfigured = !!process.env.AIESEC_GIS_TOKEN;

  return (
    <main className="min-h-screen bg-[var(--bg,#0a0a0a)] text-white p-8">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Projects Data Debug</h1>
            <p className="text-gray-400 text-sm max-w-3xl leading-relaxed">
              Inspect the raw GIS payload coming from EXPA/GIS, compare it with the transformed
              project objects used by the site, and export the active transformed rows to CSV.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/api/admin/projects-data"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              <Database size={15} aria-hidden="true" />
              Open JSON API
            </a>

            <a
              href="/api/admin/projects-data/export"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-dark)] transition-colors"
            >
              <Download size={15} aria-hidden="true" />
              Export active CSV
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-2">Source</p>
            <p className="text-sm text-white font-semibold">
              {isConfigured ? "AIESEC GIS / EXPA live API" : "Static fallback / no live token"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-2">Raw rows</p>
            <p className="text-2xl font-bold text-white">{raw.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 mb-2">Active transformed rows</p>
            <p className="text-2xl font-bold text-emerald-400">{activeTransformed.length}</p>
          </div>
        </div>

        {raw.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center">
            <p className="text-lg text-gray-300 mb-2">No opportunities loaded.</p>
            {!isConfigured && (
              <p className="text-sm text-gray-500">
                Set <code className="text-yellow-400">AIESEC_GIS_TOKEN</code> to fetch live data.
              </p>
            )}
          </div>
        ) : (
          <>
            <section className="mb-10">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Raw GIS Opportunities ({raw.length})</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Direct payload values before site transformation.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                    <tr>
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
                        "Fee"
                      ].map((col) => (
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
                        <td className="px-3 py-2 text-gray-300 max-w-[240px] truncate" title={opp.title}>
                          {opp.title}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={opp.status === "open" ? "text-emerald-400" : "text-gray-500"}>
                            {opp.status ?? "—"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">
                          {opp.programme?.short_name ?? "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.openings ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.available_openings ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.earliest_start_date ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{opp.latest_end_date ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[160px] truncate" title={opp.host_lc?.name}>
                          {opp.host_lc?.name ?? "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                          {opp.sdg_info?.sdg_target?.goal_index ?? "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                          {opp.logistics_info?.accommodation_covered ?? "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                          {opp.logistics_info?.food_covered ?? "—"}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">
                          {opp.logistics_info?.transportation_covered ?? "—"}
                        </td>
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

            <section className="mb-10">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">Active Transformed Projects ({activeTransformed.length})</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    These are the transformed rows currently eligible for the public site and CSV export.
                  </p>
                </div>

                <a
                  href="/api/admin/projects-data/export"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-colors"
                >
                  <Table2 size={15} aria-hidden="true" />
                  Download CSV
                </a>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                    <tr>
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
                        "Description"
                      ].map((col) => (
                        <th key={col} className="px-3 py-2 whitespace-nowrap border-b border-white/10">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTransformed.map((p) => (
                      <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.id}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[180px] truncate" title={p.slug}>
                          {p.slug}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[220px] truncate" title={p.title}>
                          {p.title}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.programme ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={p.isOpen ? "text-emerald-400" : "text-gray-500"}>
                            {p.isOpen ? "open" : "closed"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.startDate ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.endDate ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.city ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.category ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">{p.sdgs.join(", ") || "—"}</td>
                        <td className="px-3 py-2 text-gray-400 max-w-[320px] truncate" title={p.description}>
                          {p.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-lg font-semibold">All Transformed Projects ({transformed.length})</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Includes active and inactive transformed rows.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-white/5 text-gray-400 uppercase tracking-wider">
                    <tr>
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
                        "Description"
                      ].map((col) => (
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
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[180px] truncate" title={p.slug}>
                          {p.slug}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300 max-w-[220px] truncate" title={p.title}>
                          {p.title}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.programme ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className={p.isOpen ? "text-emerald-400" : "text-gray-500"}>
                            {p.isOpen ? "open" : "closed"}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.startDate ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.endDate ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.city ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-300">{p.category ?? "—"}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-gray-400">{p.sdgs.join(", ") || "—"}</td>
                        <td className="px-3 py-2 text-gray-400 max-w-[320px] truncate" title={p.description}>
                          {p.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <div className="mt-10 pt-6 border-t border-white/10">
          <Link href="/admin" className="text-sm text-gray-500 hover:text-white transition-colors">
            Back to admin
          </Link>
        </div>
      </div>
    </main>
  );
}
'@
Write-TextFile $pagePath $pageContent

Write-Section "Writing CSV export API route"
$routeContent = @'
import { NextResponse } from "next/server";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

function csvEscape(value: unknown): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (process.env.APP_ENV === "production" || process.env.APP_ENV === undefined) {
    return new NextResponse(null, { status: 404 });
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);
  const active = transformed.filter((project) => project.isOpen);

  const headers = [
    "id",
    "slug",
    "title",
    "programme",
    "isOpen",
    "startDate",
    "endDate",
    "city",
    "category",
    "sdgs",
    "description",
  ];

  const lines = [
    headers.join(","),
    ...active.map((project) =>
      [
        csvEscape(project.id),
        csvEscape(project.slug),
        csvEscape(project.title),
        csvEscape(project.programme ?? ""),
        csvEscape(project.isOpen ? "open" : "closed"),
        csvEscape(project.startDate ?? ""),
        csvEscape(project.endDate ?? ""),
        csvEscape(project.city ?? ""),
        csvEscape(project.category ?? ""),
        csvEscape(Array.isArray(project.sdgs) ? project.sdgs.join("|") : ""),
        csvEscape(project.description ?? ""),
      ].join(",")
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="active-projects.csv"',
    },
  });
}
'@
Write-TextFile $routePath $routeContent

Write-Section "Done"
Write-Host "Admin raw-data page and CSV export route created." -ForegroundColor Green
Write-Host ""
Write-Host "Pages / routes:" -ForegroundColor Cyan
Write-Host "  /admin/projects-data" -ForegroundColor White
Write-Host "  /api/admin/projects-data" -ForegroundColor White
Write-Host "  /api/admin/projects-data/export" -ForegroundColor White
Write-Host ""
Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
