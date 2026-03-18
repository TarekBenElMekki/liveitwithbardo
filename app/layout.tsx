// Root layout — minimal shell.
// All rendering happens in app/[locale]/layout.tsx.
// This file is required by Next.js but the [locale] layout handles
// the actual <html> and <body> tags.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
