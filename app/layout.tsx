import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Live it With AIESEC in Bardo",
  description:
    "Discover Tunisia through the eyes of those who lived it. Join AIESEC in Bardo for an immersive cultural exchange experience.",
};

/**
 * Root layout — provides the <html>/<body> shell for ALL routes,
 * including /admin/* which has no locale prefix.
 * The locale layout adds intl, navbar, footer etc. on top of this.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
