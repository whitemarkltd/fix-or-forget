import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Fix or Ditch exists: a neutral, transparent tool for the repair-or-replace decision.",
};

export default function AboutPage() {
  return (
    <Prose title="About Fix or Ditch">
      <p>
        Something breaks, and you&apos;re stuck: pay to fix an aging device, or put
        that money toward a replacement? The honest answer depends on numbers most
        people don&apos;t have handy — repair prices, refurbished values, trade-in
        offers, and how much longer the device will get software updates.
      </p>
      <p>
        Fix or Ditch pulls those together and gives a clear verdict, with every figure
        on the table. We&apos;re deliberately a <strong>neutral referee</strong>:
        sometimes the tool says repair, sometimes it says replace. That&apos;s the
        point — a recommendation you can trust is one that isn&apos;t always trying to
        sell you something.
      </p>
      <h2>How we stay free</h2>
      <p>
        When repairing or replacing is the right move, we link to places that can help
        — refurbished marketplaces, DIY parts, and trade-in services — and some of
        those are affiliate links that earn us a small commission. They never change
        the verdict. See our{" "}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link> for details.
      </p>
      <h2>A work in progress</h2>
      <p>
        Prices change constantly. We maintain the data by hand and mark our confidence
        level on every estimate. If a verdict didn&apos;t match your real-world quote,
        tell us with the feedback button — it&apos;s the fastest way we improve.
      </p>
    </Prose>
  );
}
