/**
 * Locale-aware data loader.
 * Returns the appropriate data for the given locale,
 * falling back to English when a translation is not available.
 */

import type { Locale } from "@/i18n/config";
import { faqEntries, FALLBACK_MESSAGE } from "@/data/faq";
import type { FaqEntry } from "@/data/faq";

export async function getFaqEntries(locale: Locale): Promise<FaqEntry[]> {
  if (locale === "fr") {
    const { faqEntriesFr } = await import("./fr/faq");
    return faqEntriesFr;
  }
  if (locale === "ar") {
    const { faqEntriesAr } = await import("./ar/faq");
    return faqEntriesAr;
  }
  return faqEntries;
}

export { FALLBACK_MESSAGE };
