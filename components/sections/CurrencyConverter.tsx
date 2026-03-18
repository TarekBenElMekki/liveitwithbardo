"use client";

import { useState, useEffect, useCallback } from "react";

const CURRENCIES = [
  { code: "TND", label: "Tunisian Dinar" },
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "MAD", label: "Moroccan Dirham" },
  { code: "DZD", label: "Algerian Dinar" },
  { code: "EGP", label: "Egyptian Pound" },
  { code: "SAR", label: "Saudi Riyal" },
  { code: "AED", label: "UAE Dirham" },
  { code: "TRY", label: "Turkish Lira" },
  { code: "BRL", label: "Brazilian Real" },
  { code: "ZAR", label: "South African Rand" },
  { code: "KRW", label: "South Korean Won" },
  { code: "SGD", label: "Singapore Dollar" },
];

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100");
  const [from, setFrom] = useState("EUR");
  const [to, setTo] = useState("TND");
  const [result, setResult] = useState<number | null>(null);
  const [source, setSource] = useState<"live" | "static" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const convert = useCallback(async () => {
    const num = parseFloat(amount);
    if (!amount.trim() || isNaN(num) || num < 0) { setResult(null); setLoading(false); return; }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`/api/currency?from=${from}&to=${to}&amount=${num}`);
      if (!res.ok) throw new Error("failed");
      const json = await res.json();
      setResult(json.result);
      setSource(json.source);
    } catch {
      setError(true);
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [amount, from, to]);

  useEffect(() => {
    const t = setTimeout(convert, 400);
    return () => clearTimeout(t);
  }, [convert]);

  const swap = () => { setFrom(to); setTo(from); };

  const fromLabel = CURRENCIES.find((c) => c.code === from)?.label ?? from;
  const toLabel   = CURRENCIES.find((c) => c.code === to)?.label ?? to;

  return (
    <section
      id="currency"
      aria-labelledby="currency-heading"
      className="py-24 px-4 sm:px-6 lg:px-8 bg-[var(--section-alt)]"
    >
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Exchange Rates
          </p>
          <h2
            id="currency-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight"
          >
            Currency Converter
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Convert between Tunisian Dinar and major world currencies.
            Rates refresh hourly from open.er-api.com.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 sm:p-8">

          {/* Amount input — full width, prominent */}
          <div className="mb-5">
            <label htmlFor="currency-amount" className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
              Amount
            </label>
            <input
              id="currency-amount"
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-5 py-4 text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent tabular-nums bg-gray-50 transition-colors"
              aria-label="Amount to convert"
              placeholder="0"
            />
          </div>

          {/* From / Swap / To row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
            <div>
              <label htmlFor="currency-from" className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                From
              </label>
              <select
                id="currency-from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                ))}
              </select>
            </div>

            {/* Swap — centred between the two selects */}
            <button
              type="button"
              onClick={swap}
              aria-label="Swap currencies"
              className="mb-0 w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 active:scale-95 flex items-center justify-center text-gray-500 transition-all duration-150 self-end"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M2 5h12M2 5l3-3M2 5l3 3M14 11H2M14 11l-3-3M14 11l-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div>
              <label htmlFor="currency-to" className="block text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                To
              </label>
              <select
                id="currency-to"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.code} — {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Result */}
          <div className="mt-5 rounded-xl bg-gray-50 border border-gray-100 px-6 py-5 min-h-[88px] flex items-center justify-between transition-all">
            {loading && (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="inline-block w-3 h-3 rounded-full border-2 border-gray-300 border-t-accent animate-spin" aria-hidden="true" />
                Converting…
              </div>
            )}
            {error && !loading && (
              <span className="text-red-500 text-sm">Conversion unavailable — please try again.</span>
            )}
            {!loading && !error && result === null && (
              <span className="text-gray-400 text-sm">Enter an amount above to see the conversion.</span>
            )}
            {!loading && !error && result !== null && (
              <>
                <div>
                  <p className="text-xs text-gray-400 mb-1">
                    {amount} {fromLabel} =
                  </p>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums leading-none">
                    {result.toLocaleString(undefined, { maximumFractionDigits: 4 })}{" "}
                    <span className="text-accent text-xl font-semibold">{to}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1.5">{toLabel}</p>
                </div>
                {source && (
                  <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
                    source === "live"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-amber-50 text-amber-600"
                  }`}>
                    {source === "live" ? "Live rate" : "Estimated"}
                  </span>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
