import { NextRequest, NextResponse } from "next/server";

/**
 * Currency conversion route.
 *
 * Primary source: open.er-api.com — free tier, no API key, supports TND.
 * Endpoint: https://open.er-api.com/v6/latest/TND
 * Returns rates as: 1 TND = X foreign currency (i.e. rates[USD] ≈ 0.32)
 *
 * Fallback: static rates below (same direction: 1 TND → foreign).
 * Update these periodically if the API is unavailable for extended periods.
 */

// 1 TND expressed in each foreign currency (how much foreign you get per 1 TND)
const STATIC_RATES_FROM_TND: Record<string, number> = {
  USD: 0.322,
  EUR: 0.303,
  GBP: 0.256,
  CAD: 0.438,
  AUD: 0.500,
  CHF: 0.290,
  JPY: 47.6,
  CNY: 2.33,
  INR: 26.9,
  MAD: 3.22,
  DZD: 43.5,
  EGP: 15.6,
  SAR: 1.21,
  AED: 1.18,
  TRY: 10.4,
  BRL: 1.61,
  MXN: 5.56,
  ZAR: 5.88,
  KRW: 435.0,
  SGD: 0.435,
};

interface RateCache {
  rates: Record<string, number>; // 1 TND → foreign
  ts: number;
  source: "live" | "static";
}

let cache: RateCache | null = null;
const CACHE_TTL = 3_600_000; // 1 hour

// ---------------------------------------------------------------------------
// In-memory rate limiter (per IP)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const RATE_LIMIT_MAX = 30;       // max requests per window
const RATE_LIMIT_WINDOW = 60_000; // 1 minute window

/** Returns true if the request should be blocked. */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;

  return false;
}

/** Best-effort IP extraction — works on Vercel and standard proxies. */
function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

// ---------------------------------------------------------------------------
// Rate fetch
// ---------------------------------------------------------------------------

async function getRatesFromTND(): Promise<RateCache> {
  if (cache && Date.now() - cache.ts < CACHE_TTL) return cache;

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/TND", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`open.er-api.com responded ${res.status}`);
    const json = await res.json();
    if (json.result !== "success" || !json.rates) throw new Error("unexpected response shape");

    cache = { rates: json.rates as Record<string, number>, ts: Date.now(), source: "live" };
    return cache;
  } catch (err) {
    console.warn("[currency route] live fetch failed, using static rates:", err);
    cache = { rates: STATIC_RATES_FROM_TND, ts: Date.now(), source: "static" };
    return cache;
  }
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      }
    );
  }

  const { searchParams } = new URL(req.url);
  const from   = (searchParams.get("from")   ?? "EUR").toUpperCase();
  const to     = (searchParams.get("to")     ?? "TND").toUpperCase();
  const amount = parseFloat(searchParams.get("amount") ?? "1");

  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    const { rates, source } = await getRatesFromTND();

    // All rates are expressed as: 1 TND = rates[X] X
    // So: 1 X = 1 / rates[X] TND

    let amountInTND: number;
    if (from === "TND") {
      amountInTND = amount;
    } else {
      const fromRate = rates[from];
      if (!fromRate) return NextResponse.json({ error: `Unsupported currency: ${from}` }, { status: 400 });
      amountInTND = amount / fromRate;
    }

    let result: number;
    if (to === "TND") {
      result = amountInTND;
    } else {
      const toRate = rates[to];
      if (!toRate) return NextResponse.json({ error: `Unsupported currency: ${to}` }, { status: 400 });
      result = amountInTND * toRate;
    }

    return NextResponse.json({
      from,
      to,
      amount,
      result: parseFloat(result.toFixed(4)),
      source,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Currency conversion unavailable" }, { status: 503 });
  }
}
