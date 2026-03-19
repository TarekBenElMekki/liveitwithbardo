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
  metadataBase: new URL("https://liveitwithbardo.vercel.app"),
  title: {
    default: "Live it With AIESEC in Bardo",
    template: "%s | Live it With AIESEC in Bardo",
  },
  description:
    "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
  keywords: ["AIESEC", "Bardo", "Tunisia", "exchange", "cultural exchange", "internship", "volunteer"],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "Live it With AIESEC in Bardo",
    description: "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
    type: "website",
    url: "https://liveitwithbardo.vercel.app",
    siteName: "Live it With AIESEC in Bardo",
    images: [
      {
        url: "/hero/hero_static_default.png",
        width: 1200,
        height: 630,
        alt: "Live it With AIESEC in Bardo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live it With AIESEC in Bardo",
    description: "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
    images: ["/hero/hero_static_default.png"],
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
