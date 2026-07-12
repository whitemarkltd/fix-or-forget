import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { SITE_NAME, SITE_TAGLINE, SITE_URL } from "@/lib/site";
import { Analytics } from "@/components/Analytics";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "A free, neutral tool that tells you whether your broken phone or laptop is worth repairing — with the full cost math shown.",
  // Served as a static asset from /public so it isn't compiled into a route
  // (next-on-pages requires non-static routes to run on the edge).
  icons: { icon: "/icon.svg" },
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    url: SITE_URL,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <header className="border-b border-black/5 bg-white">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span aria-hidden className="text-accent">◑</span>
              <span>{SITE_NAME}</span>
            </Link>
            <nav className="flex items-center gap-4 text-sm text-ink/70">
              <Link href="/check" className="hover:text-accent">Start</Link>
              <Link href="/how-it-works" className="hover:text-accent">How it works</Link>
              <Link href="/about" className="hidden hover:text-accent sm:inline">About</Link>
            </nav>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-black/5 bg-white">
          <div className="mx-auto max-w-4xl px-4 py-8 text-sm text-ink/60">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              <Link href="/how-it-works" className="hover:text-accent">How it works</Link>
              <Link href="/about" className="hover:text-accent">About</Link>
              <Link href="/affiliate-disclosure" className="hover:text-accent">Affiliate disclosure</Link>
              <Link href="/privacy" className="hover:text-accent">Privacy</Link>
            </div>
            <p className="mt-4 text-xs text-ink/50">
              {SITE_NAME} is a neutral guide, not a repair shop. Prices are estimates —
              always confirm with a quote. Some outbound links are affiliate links;
              they never change our verdict.
            </p>
          </div>
        </footer>

        <Analytics />
      </body>
    </html>
  );
}
