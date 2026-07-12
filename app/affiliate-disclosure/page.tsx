import type { Metadata } from "next";
import { Prose } from "@/components/Prose";

export const metadata: Metadata = {
  title: "Affiliate disclosure",
  description:
    "How Fix or Ditch uses affiliate links, and our promise that they never influence a verdict.",
};

export default function AffiliateDisclosurePage() {
  return (
    <Prose title="Affiliate disclosure">
      <p>
        Fix or Ditch is free to use. To cover our costs, some of the outbound buttons
        on our verdict and device pages are <strong>affiliate links</strong>. If you
        buy a refurbished device, order DIY repair parts, or trade in a device through
        one of them, we may earn a small commission at no extra cost to you.
      </p>
      <h2>Our promise</h2>
      <ul>
        <li>Affiliate relationships <strong>never</strong> influence a verdict. The recommendation comes purely from the cost math, computed before any link is shown.</li>
        <li>We show links for <em>both</em> outcomes — repair and replacement — so we&apos;re not incentivised to push you toward the pricier one.</li>
        <li>Every affiliate link is marked with <code>rel=&quot;sponsored nofollow&quot;</code> and labelled near the button.</li>
      </ul>
      <h2>Who we may link to</h2>
      <p>
        Refurbished marketplaces (such as Back Market or Amazon Renewed), DIY parts
        suppliers (such as iFixit), and trade-in / buyback services. The specific
        partners may change over time.
      </p>
      <p>
        &quot;What shops charge&quot; links are plain informational searches and are not
        affiliate links.
      </p>
    </Prose>
  );
}
