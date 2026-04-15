import { NextResponse } from "next/server";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

function csvEscape(value: unknown): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function getProgrammeDisplay(
  programme: { id: string; short_name: string | null } | null | undefined
) {
  const p = programme as
    | ({ id: string; short_name: string | null; short_name_display?: string | null })
    | null
    | undefined;

  return p?.short_name_display ?? p?.short_name ?? "";
}

export async function GET() {
  if (process.env.APP_ENV === "production" || process.env.APP_ENV === undefined) {
    return new NextResponse(null, { status: 404 });
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);
  const active = transformed.filter((project) => project.isOpen);

  const programmeByRawId = new Map(
    raw.map((opp) => [String(opp.id), getProgrammeDisplay(opp.programme)])
  );

  const getProgrammeForTransformedId = (id: string) =>
    programmeByRawId.get(String(id).replace(/^opp-/, "")) ?? "";

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
        csvEscape(getProgrammeForTransformedId(project.id)),
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