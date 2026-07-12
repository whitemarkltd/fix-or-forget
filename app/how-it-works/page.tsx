import type { Metadata } from "next";
import Link from "next/link";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How Fix or Forget decides whether to repair or replace: the exact math and rules behind every verdict.",
};

export default function HowItWorksPage() {
  return (
    <Prose title="How it works">
      <p>
        Fix or Forget answers one question: is your broken phone or laptop worth
        repairing, or should you replace it? We show the full math so you can judge
        for yourself.
      </p>

      <h2>The math</h2>
      <p>For a listed device we compute:</p>
      <ul>
        <li><strong>Repair cost</strong> — the midpoint of a typical independent-shop range (we also show the official manufacturer range).</li>
        <li><strong>Net replacement cost</strong> — the refurbished price of the same model, minus the trade-in value of your broken one.</li>
        <li><strong>Effective value</strong> — the refurbished price adjusted for your device&apos;s overall condition (good ×1.0, worn ×0.85, poor ×0.65).</li>
        <li><strong>Repair-to-value ratio</strong> — repair cost ÷ effective value. This is the number that drives the verdict.</li>
        <li><strong>Support window</strong> — how many years of security updates the device has left.</li>
      </ul>

      <h2>The rules</h2>
      <ul>
        <li>No security updates left → <strong>Replace</strong>.</li>
        <li>Repair is under 30% of the device&apos;s value and 2+ years of updates remain → <strong>Repair</strong>.</li>
        <li>Same, but only 1 year of updates left → <strong>Repair (leaning)</strong>, with a heads-up to plan a replacement soon.</li>
        <li>Repair is 30–60% of value → <strong>Borderline</strong>: we show both paths and lead with the cheaper one.</li>
        <li>Repair is over 60% of value → <strong>Replace</strong> — unless you&apos;d DIY and the parts bring it back under 30%, then <strong>Repair (DIY)</strong> with a skill warning.</li>
        <li>&quot;Won&apos;t turn on&quot; and water damage always need a diagnosis first, so we flag those.</li>
      </ul>

      <h2>About the numbers</h2>
      <p>
        Prices are hand-maintained estimates, currently marked low-confidence while we
        verify them against real listings and manufacturer pages. They&apos;re a
        starting point — always confirm with an actual quote. Spot something off?{" "}
        <Link href="/check">Run a check</Link> and use the feedback button.
      </p>
    </Prose>
  );
}
