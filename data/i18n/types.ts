/**
 * Locale-aware data loading types.
 *
 * Architecture:
 * - data/*.ts = English canonical source (existing files, unchanged)
 * - data/i18n/[locale]/*.ts = translated content for fr/ar
 * - data/i18n/loader.ts = unified loader that returns locale-appropriate data
 *
 * Structural fields (sdgs, dates, city, category, isOpen, slug, coordinates)
 * are locale-independent and always come from the canonical English source.
 * Only human-readable text fields (title, description, question, answer, etc.)
 * are translated.
 */

import type { Locale } from "@/i18n/config";

export type { Locale };
