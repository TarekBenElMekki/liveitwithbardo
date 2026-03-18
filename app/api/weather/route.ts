import { NextResponse } from "next/server";
import type { WeatherData, WeatherDay } from "@/lib/weather-types";

/**
 * Weather route — Open-Meteo (free, no API key required).
 *
 * Le Bardo, Tunisia (suburb of Tunis):
 *   Latitude:  36.8190°N
 *   Longitude: 10.1390°E
 * Source: Open-Meteo geocoding API confirmed these coordinates for "Le Bardo".
 *
 * Server-side cached for 30 minutes via Next.js fetch cache.
 */

const LAT = 36.819;
const LON = 10.139;
const CITY = "Le Bardo";

const OPEN_METEO_URL =
  `https://api.open-meteo.com/v1/forecast` +
  `?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m` +
  `&daily=temperature_2m_max,temperature_2m_min,weather_code` +
  `&timezone=Africa%2FTunis` +
  `&forecast_days=7`;

export async function GET() {
  try {
    const res = await fetch(OPEN_METEO_URL, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Open-Meteo responded ${res.status}`);

    const raw = await res.json() as {
      current: {
        temperature_2m: number;
        apparent_temperature: number;
        weather_code: number;
        wind_speed_10m: number;
        relative_humidity_2m: number;
      };
      daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        weather_code: number[];
      };
    };

    const forecast: WeatherDay[] = raw.daily.time.map((date, i) => ({
      date,
      maxTemp: Math.round(raw.daily.temperature_2m_max[i]),
      minTemp: Math.round(raw.daily.temperature_2m_min[i]),
      weatherCode: raw.daily.weather_code[i],
    }));

    const data: WeatherData = {
      city: CITY,
      temperature: Math.round(raw.current.temperature_2m),
      apparentTemperature: Math.round(raw.current.apparent_temperature),
      humidity: Math.round(raw.current.relative_humidity_2m),
      windSpeed: Math.round(raw.current.wind_speed_10m),
      weatherCode: raw.current.weather_code,
      forecast,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error("[weather route]", err);
    return NextResponse.json({ error: "Weather data unavailable" }, { status: 503 });
  }
}
