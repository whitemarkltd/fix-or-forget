"use client";

import Link from "next/link";
import { useEffect } from "react";

// Route-level error boundary: turns any client render error into a readable
// message + recovery instead of a blank screen.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <p className="mt-2 text-ink/60">
        We hit an unexpected error rendering this page.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-ink"
        >
          Try again
        </button>
        <Link
          href="/check"
          className="rounded-lg border border-black/15 px-4 py-2.5 text-sm font-medium"
        >
          Start over
        </Link>
      </div>
    </div>
  );
}
