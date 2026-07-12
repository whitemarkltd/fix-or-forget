"use client";

import { useState } from "react";

// Copies the current verdict URL. All wizard state is in the query string, so
// the copied link reproduces this exact verdict.
export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({ title: "Fix or Forget verdict", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* user cancelled share / clipboard blocked — no-op */
    }
  }

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 rounded-lg border border-black/15 bg-white px-4 py-2.5 text-sm font-medium text-ink/80 hover:border-accent hover:text-accent"
    >
      <span aria-hidden>🔗</span>
      {copied ? "Link copied!" : "Copy / share this verdict"}
    </button>
  );
}
