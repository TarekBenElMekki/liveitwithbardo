import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatAgent } from "@/components/chat/ChatAgent";
import { CountryLanguagePicker } from "@/components/onboarding/CountryLanguagePicker";
import { PromoBar } from "@/components/layout/PromoBar";
import { locales, isRtl, type Locale } from "@/i18n/config";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AIESEC in Bardo — Experience Platform",
    template: "%s | AIESEC in Bardo",
  },
  description:
    "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
  keywords: ["AIESEC", "Bardo", "Tunisia", "exchange", "cultural exchange", "internship", "volunteer"],
  openGraph: {
    title: "AIESEC in Bardo — Experience Platform",
    description: "Live your experience with Bardo. Join 1,000+ exchange participants across 50+ countries.",
    type: "website",
  },
};

// generateStaticParams is intentionally removed from this layout.
// The homepage reads the published hero config on every request (dynamic),
// so the entire [locale] segment must be server-rendered on demand.
// If you need static generation for specific pages in the future, add
// generateStaticParams to those individual page files instead.

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages();
  const dir = isRtl(locale as Locale) ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir} className={inter.variable}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PromoBar />
          <Navbar />
          {children}
          <Footer />
          <ChatAgent />
          <CountryLanguagePicker />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
