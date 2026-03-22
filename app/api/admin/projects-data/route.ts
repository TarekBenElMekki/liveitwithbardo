import { NextResponse } from "next/server";
import { loadRawOpportunities } from "@/lib/projects/loader";
import { transformGisOpportunity } from "@/lib/projects/transform";

/**
 * GET /api/admin/projects-data
 *
 * Returns raw GIS opportunity rows and their transformed Project equivalents as JSON.
 * Protected by middleware — 404 in production, session-required in staging.
 */
export async function GET() {
  // Belt-and-suspenders server guard (middleware already blocks in production)
  if (process.env.APP_ENV !== "staging" && process.env.ENABLE_ADMIN !== "true") {
    return new NextResponse(null, { status: 404 });
  }

  const raw = await loadRawOpportunities();
  const transformed = raw.map(transformGisOpportunity);

  return NextResponse.json(
    { raw, transformed, count: raw.length },
    {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "application/json",
      },
    }
  );
}
