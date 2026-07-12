import Link from "next/link";
import { devices } from "@/data";
import { usd } from "@/lib/format";
import { SITE_TAGLINE } from "@/lib/site";

const TRUST_POINTS = [
  { icon: "⚖️", title: "Neutral referee", text: "We recommend repair or replacement — whichever the math favours. No thumb on the scale." },
  { icon: "🧾", title: "Full math, shown", text: "Every verdict shows the repair range, refurbished price, and trade-in value it's based on." },
  { icon: "🔒", title: "No account, no tracking", text: "No login, no cookie banner. Answer a few questions, get an answer, share the link." },
];

export default function HomePage() {
  const popular = [
    "iphone-13",
    "iphone-14",
    "galaxy-s23",
    "pixel-8",
    "macbook-air-m1",
    "dell-xps-13-9310",
  ]
    .map((id) => devices.find((d) => d.id === id))
    .filter(Boolean);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Is it worth repairing?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-ink/70">
            {SITE_TAGLINE} Tell us your device and what broke — we&apos;ll show the
            costs and give a clear verdict.
          </p>
          <div className="mt-8">
            <Link
              href="/check"
              className="inline-block rounded-xl bg-accent px-7 py-3.5 text-base font-semibold text-white hover:bg-accent-ink"
            >
              Check my device →
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink/50">Free · 5 taps · no sign-up</p>
        </div>
      </section>

      {/* Trust points */}
      <section className="mx-auto max-w-4xl px-4 py-12">
        <div className="grid gap-6 sm:grid-cols-3">
          {TRUST_POINTS.map((p) => (
            <div key={p.title} className="rounded-xl border border-black/10 bg-white p-5">
              <div className="text-2xl" aria-hidden>{p.icon}</div>
              <h2 className="mt-2 font-semibold">{p.title}</h2>
              <p className="mt-1 text-sm text-ink/60">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular devices */}
      <section className="mx-auto max-w-4xl px-4 pb-16">
        <h2 className="text-lg font-semibold">Popular devices</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {popular.map((d) => (
            <Link
              key={d!.id}
              href={`/device/${d!.id}`}
              className="rounded-xl border border-black/10 bg-white p-4 hover:border-accent hover:bg-accent-soft"
            >
              <p className="text-xs text-ink/50">{d!.brand}</p>
              <p className="font-medium">{d!.name}</p>
              <p className="receipt-num mt-1 text-xs text-ink/50">
                refurb ~{usd(d!.refurbishedPriceUSD)} · updates to ~{d!.supportEndYear}
              </p>
            </Link>
          ))}
        </div>
        <p className="mt-6 text-sm text-ink/50">
          Don&apos;t see yours?{" "}
          <Link href="/check" className="text-accent underline">
            Use the checker
          </Link>{" "}
          — it handles unlisted devices too.
        </p>
      </section>
    </div>
  );
}
