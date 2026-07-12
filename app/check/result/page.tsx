"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { decodeState } from "@/lib/wizardState";
import { resolveVerdict } from "@/lib/resolveVerdict";
import { VerdictView } from "@/components/VerdictView";

// Verdict page. All state is in the query string, so this URL is fully
// shareable and reproducible. Computed client-side from static data.
function Result() {
  const params = useSearchParams();
  const state = decodeState(params);

  if (!state) {
    return <ResultError message="This link is missing some details." />;
  }
  const result = resolveVerdict(state);
  if (!result.ok) {
    return <ResultError message={result.error} />;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <VerdictView resolved={result.data} />
      <div className="mt-8 text-center">
        <Link href="/check" className="text-sm text-accent underline">
          ← Check another device
        </Link>
      </div>
    </div>
  );
}

function ResultError({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Hmm — we couldn&apos;t read that</h1>
      <p className="mt-2 text-ink/60">{message}</p>
      <Link
        href="/check"
        className="mt-6 inline-block rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white"
      >
        Start over
      </Link>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-ink/50">Loading…</div>}>
      <Result />
    </Suspense>
  );
}
