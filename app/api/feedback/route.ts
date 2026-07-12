import { NextResponse } from "next/server";

// Serverless function: forwards feedback submissions to a webhook configured via
// FEEDBACK_WEBHOOK_URL (e.g. a Formspree/Google-Apps-Script/Zapier endpoint).
// No database. If no webhook is set, we accept and no-op so the UI still works.
// Edge runtime keeps this deployable on both Vercel and Cloudflare Pages
// (via @cloudflare/next-on-pages). It only uses fetch, which edge supports.
export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad-json" }, { status: 400 });
  }

  const { vote, comment, context, url } = (payload ?? {}) as Record<string, unknown>;
  if (vote !== "up" && vote !== "down") {
    return NextResponse.json({ ok: false, error: "bad-vote" }, { status: 400 });
  }

  const record = {
    vote,
    comment: typeof comment === "string" ? comment.slice(0, 2000) : "",
    context: typeof context === "string" ? context.slice(0, 500) : "",
    url: typeof url === "string" ? url.slice(0, 1000) : "",
    at: new Date().toISOString(),
  };

  const webhook = process.env.FEEDBACK_WEBHOOK_URL;
  if (!webhook) {
    // Accept silently in dev / before the webhook is wired up.
    console.log("[feedback] (no webhook configured)", record);
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(record),
    });
    return NextResponse.json({ ok: res.ok, forwarded: true });
  } catch {
    return NextResponse.json({ ok: false, error: "forward-failed" }, { status: 502 });
  }
}
