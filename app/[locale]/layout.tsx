import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatAgent } from "@/components/chat/ChatAgent";
import { CountryLanguagePicker } from "@/components/onboarding/CountryLanguagePicker";
import { PromoBar } from "@/components/layout/PromoBar";
import { locales, type Locale } from "@/i18n/config";
import { appUrl, showChatAgent, isProduction } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
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
    url: appUrl,
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

  return (
    <NextIntlClientProvider messages={messages}>
      {/* PromoBar self-guards via NEXT_PUBLIC_SHOW_PROMO_BAR */}
      <PromoBar />
      <Navbar isProduction={isProduction} />
      {children}
      <Footer />
      {/* ChatAgent controlled by NEXT_PUBLIC_SHOW_CHAT_AGENT */}
      {showChatAgent && <ChatAgent />}
      <CountryLanguagePicker />
    </NextIntlClientProvider>
  );
}
