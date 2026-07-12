import type { Metadata } from "next";
import { Suspense } from "react";
import { Wizard } from "@/components/Wizard";
import type { Category } from "@/data/types";

export const metadata: Metadata = {
  title: "Check your device",
  description:
    "Answer a few quick questions and get a clear repair-or-replace verdict with the full cost math.",
  alternates: { canonical: "/check" },
};

// This page reads `searchParams` (deep-link prefill), so it renders on demand.
// Cloudflare Pages (via next-on-pages) requires non-static routes to be edge.
export const runtime = "edge";

// Pre-fill support so SEO pages can deep-link into the wizard.
export default function CheckPage({
  searchParams,
}: {
  searchParams: { device?: string; fault?: string; cat?: string };
}) {
  const category =
    searchParams.cat === "phone" || searchParams.cat === "laptop"
      ? (searchParams.cat as Category)
      : undefined;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Fix or forget?</h1>
        <p className="mt-1 text-ink/60">Five taps to a straight answer.</p>
      </div>
      <Suspense>
        <Wizard
          initialCategory={category}
          initialDeviceId={searchParams.device}
          initialFaultId={searchParams.fault}
        />
      </Suspense>
    </div>
  );
}
