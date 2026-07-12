import type { Metadata } from "next";

// The result page is computed from query params — an unbounded set of thin,
// near-duplicate URLs. Keep it out of the index (but let crawlers follow its
// links) so it can't dilute the canonical SEO pages under /repair and /device.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function ResultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
