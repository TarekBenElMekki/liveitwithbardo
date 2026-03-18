"use client";

import { useCallback, useEffect, useState } from "react";
import type { WeatherData } from "@/lib/weather-types";

function wmoEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2)  return "⛅";
  if (code === 3) return "☁️";
  if (code <= 49) return "🌫️";
  if (code <= 59) return "🌦️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 82) return "🌧️";
  if (code <= 84) return "🌨️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

function wmoLabel(code: number): string {
  if (code === 0) return "Clear sky";
  if (code <= 2)  return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code <= 49) return "Foggy";
  if (code <= 59) return "Drizzle";
  if (code <= 69) return "Rain";
  if (code <= 79) return "Snow";
  if (code <= 82) return "Rain showers";
  if (code <= 84) return "Snow showers";
  if (code <= 99) return "Thunderstorm";
  return "Unknown";
}

function formatDay(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function ClimateSection() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [stale, setStale] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchWeather = useCallback((isRetry = false) => {
    if (isRetry) { setLoading(true); setError(false); }
    fetch("/api/weather")
      .then((r) => { if (!r.ok) throw new Error("failed"); return r.json() as Promise<WeatherData>; })
      .then((data) => { setWeather(data); setStale(false); setError(false); setLoading(false); })
      .catch(() => {
        setError(true);
        setLoading(false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
        if (weather) setStale(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { fetchWeather(); }, [fetchWeather]);

  return (
    <section aria-labelledby="climate-heading" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
            Live Weather
          </p>
          <h2 id="climate-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 leading-tight">
            Climate &amp; Weather
          </h2>
          <p className="text-gray-500 max-w-lg text-base leading-relaxed">
            Mediterranean climate — warm summers, mild winters. Spring and autumn
            are the sweet spots for exchange participants.
          </p>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/5" />
            </div>
          </div>
        )}

        {/* Error — no data */}
        {error && !weather && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-8 flex flex-col items-center gap-3 text-center">
            <span className="text-3xl" aria-hidden="true">🌐</span>
            <p className="text-gray-500 text-sm">Live weather data is temporarily unavailable.</p>
            <button
              onClick={() => fetchWeather(true)}
              className="mt-1 text-sm font-semibold text-accent hover:underline focus-ring rounded"
            >
              Try again
            </button>
          </div>
        )}

        {/* Data */}
        {weather && (
          <div className="flex flex-col gap-3">

            {/* Stale banner */}
            {stale && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-700 flex items-center justify-between">
                <span>Showing last known data — live update failed.</span>
                <button onClick={() => fetchWeather(true)} className="font-semibold underline ml-3 focus-ring rounded">
                  Retry
                </button>
              </div>
            )}

            {/* Current conditions */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
              <div className="p-6 flex flex-col sm:flex-row items-start gap-6">
                {/* Temp + condition */}
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-6xl leading-none" aria-hidden="true">{wmoEmoji(weather.weatherCode)}</span>
                  <div>
                    <p className="text-5xl font-bold text-gray-900 tabular-nums leading-none">
                      {weather.temperature}°<span className="text-2xl font-normal text-gray-400">C</span>
                    </p>
                    <p className="text-sm text-gray-400 mt-1">Feels like {weather.apparentTemperature}°C</p>
                    <p className="text-base font-semibold text-gray-700 mt-1.5">{wmoLabel(weather.weatherCode)}</p>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <span aria-hidden="true">📍</span> {weather.city}, Tunisia
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-3 sm:flex-col sm:items-end">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-base" aria-hidden="true">💧</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{weather.humidity}%</span>
                    <span className="text-gray-400 text-xs">humidity</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-base" aria-hidden="true">💨</span>
                    <span className="font-semibold text-gray-900 tabular-nums">{weather.windSpeed} km/h</span>
                    <span className="text-gray-400 text-xs">wind</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 7-day forecast */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {weather.forecast.map((day) => (
                <div
                  key={day.date}
                  className="rounded-xl border border-gray-100 bg-white p-3 flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-lg leading-none" aria-hidden="true">{wmoEmoji(day.weatherCode)}</span>
                  <span className="text-[10px] font-semibold text-gray-500 leading-tight mt-0.5">
                    {formatDay(day.date)}
                  </span>
                  <span className="text-accent text-xs font-bold tabular-nums">{day.maxTemp}°</span>
                  <span className="text-gray-400 text-xs tabular-nums">{day.minTemp}°</span>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-right">
              Open-Meteo · {new Date(weather.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
