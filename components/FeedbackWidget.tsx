"use client";

import { useState } from "react";

// "Did this match the quotes you got?" 👍/👎 + optional text.
// POSTs to the /api/feedback serverless function which forwards to a webhook.
export function FeedbackWidget({ context }: { context?: string }) {
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);

  async function submit(nextVote: "up" | "down") {
    setVote(nextVote);
    await send(nextVote, text);
  }

  async function submitText() {
    if (!vote) return;
    await send(vote, text);
  }

  async function send(v: "up" | "down", comment: string) {
    setError(false);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vote: v,
          comment,
          context: context ?? "",
          url: typeof window !== "undefined" ? window.location.href : "",
        }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError(true);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-ink/70">
        Thanks — your feedback helps us keep the numbers honest. 🙏
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      <p className="text-sm font-medium text-ink/80">
        Did this match the quotes you got?
      </p>
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => submit("up")}
          aria-pressed={vote === "up"}
          className={`rounded-lg border px-3 py-2 text-sm ${
            vote === "up" ? "border-repair bg-repair-soft" : "border-black/15"
          }`}
        >
          👍 Yes
        </button>
        <button
          onClick={() => submit("down")}
          aria-pressed={vote === "down"}
          className={`rounded-lg border px-3 py-2 text-sm ${
            vote === "down" ? "border-borderline bg-borderline-soft" : "border-black/15"
          }`}
        >
          👎 Not really
        </button>
      </div>
      {vote && (
        <div className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Optional: what did you actually get quoted?"
            rows={2}
            className="w-full rounded-lg border border-black/15 p-2 text-sm"
          />
          <button
            onClick={submitText}
            className="mt-2 rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent-ink"
          >
            Send comment
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-replace">
          Couldn&apos;t send just now — feedback isn&apos;t configured or the network
          failed. Thanks for trying!
        </p>
      )}
    </div>
  );
}
