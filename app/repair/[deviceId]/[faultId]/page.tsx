import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  allDeviceFaultPairs,
  getDevice,
  getFault,
  getRepairCost,
  getFaultsForDevice,
  repairCosts,
} from "@/data";
import {
  seoTitle,
  seoDescription,
  typicalVerdict,
  miniVerdictSentence,
  faqItems,
  faqJsonLd,
  breadcrumbJsonLd,
  faultNoun,
} from "@/lib/seo";
import { usdRange, usd } from "@/lib/format";
import { VerdictHeadline } from "@/components/VerdictHeadline";
import { MathReceipt } from "@/components/MathReceipt";
import { SupportBar } from "@/components/SupportBar";
import { VerdictActions } from "@/components/VerdictActions";

interface Params {
  params: { deviceId: string; faultId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return allDeviceFaultPairs();
}

export function generateMetadata({ params }: Params): Metadata {
  const device = getDevice(params.deviceId);
  const fault = getFault(params.faultId);
  const cost = getRepairCost(params.deviceId, params.faultId);
  if (!device || !fault || !cost) return {};
  const title = seoTitle(device, fault);
  const description = seoDescription(device, fault, cost);
  const canonical = `/repair/${device.id}/${fault.id}`;
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default function RepairSeoPage({ params }: Params) {
  const device = getDevice(params.deviceId);
  const fault = getFault(params.faultId);
  const cost = getRepairCost(params.deviceId, params.faultId);
  if (!device || !fault || !cost) notFound();

  const verdict = typicalVerdict(device, fault, cost);
  const faqs = faqItems(device, fault, cost, verdict);
  const jsonLd = faqJsonLd(faqs);
  const breadcrumbLd = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: device.name, path: `/device/${device.id}` },
    { name: faultNoun(fault), path: `/repair/${device.id}/${fault.id}` },
  ]);

  // Sibling links.
  const sameDevice = getFaultsForDevice(device.id).filter((f) => f.id !== fault.id);
  const sameFault = repairCosts
    .filter((r) => r.faultId === fault.id && r.deviceId !== device.id)
    .map((r) => getDevice(r.deviceId)!)
    .filter(Boolean);

  const ctaHref = `/check?device=${device.id}&fault=${fault.id}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <nav className="mb-4 text-xs text-ink/50">
        <Link href="/" className="hover:text-accent">Home</Link> ·{" "}
        <Link href={`/device/${device.id}`} className="hover:text-accent">
          {device.name}
        </Link>{" "}
        · <span>{faultNoun(fault)}</span>
      </nav>

      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
        {device.name} {faultNoun(fault)}: repair or replace?
      </h1>
      <p className="mt-2 text-ink/60">
        A {new Date().getFullYear()} cost comparison — independent shop vs. official
        repair vs. a refurbished replacement.
      </p>

      {/* Cost table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody className="[&_td]:border-b [&_td]:border-black/5 [&_td]:py-2.5">
            <tr>
              <td className="text-ink/70">Independent shop repair</td>
              <td className="receipt-num text-right font-semibold">
                {usdRange(cost.independentUSD)}
              </td>
            </tr>
            <tr>
              <td className="text-ink/70">Official ({device.brand}) repair</td>
              <td className="receipt-num text-right">{usdRange(cost.officialUSD)}</td>
            </tr>
            {cost.diyPartsUSD && (
              <tr>
                <td className="text-ink/70">DIY parts only</td>
                <td className="receipt-num text-right">{usdRange(cost.diyPartsUSD)}</td>
              </tr>
            )}
            <tr>
              <td className="text-ink/70">Refurbished replacement</td>
              <td className="receipt-num text-right">{usd(device.refurbishedPriceUSD)}</td>
            </tr>
            <tr>
              <td className="text-ink/70">
                Trade-in of the broken one ({fault.faultClass})
              </td>
              <td className="receipt-num text-right">
                {usd(device.tradeInBrokenUSD[fault.faultClass])}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-ink/45">
        {cost.confidence === "low" ? "Low-confidence placeholder estimates" : `${cost.confidence}-confidence estimates`}
        {" "}— always confirm with a real quote.
      </p>

      {/* Mini verdict */}
      <div className="mt-8">
        <VerdictHeadline verdict={verdict} />
        <p className="mt-3 text-sm text-ink/70">{miniVerdictSentence(verdict, device)}</p>
      </div>

      {/* Fault-specific guidance (varies by fault to avoid duplicate content) */}
      <div className="mt-6 rounded-xl border border-black/10 bg-white p-4 text-sm text-ink/75">
        <p>{fault.seoGuidance.replace(/\{device\}/g, device.name)}</p>
        <p className="mt-2">{fault.descriptionShort}</p>
      </div>

      {/* Inline CTA into the wizard, pre-filled */}
      <div className="mt-6 rounded-xl border border-accent/25 bg-accent-soft p-5 text-center">
        <p className="font-medium text-accent-ink">
          Get the verdict for <em>your</em> exact situation
        </p>
        <p className="mt-1 text-sm text-accent-ink/70">
          Factor in your device&apos;s condition and whether you&apos;d DIY.
        </p>
        <Link
          href={ctaHref}
          className="mt-3 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-ink"
        >
          Run the {device.name} checker →
        </Link>
      </div>

      {/* Support bar */}
      <div className="mt-6">
        <SupportBar
          supportEndYear={device.supportEndYear}
          releaseYear={device.releaseYear}
        />
      </div>

      {/* Actions */}
      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Next step
        </h2>
        <VerdictActions verdict={verdict} device={device} faults={[fault]} />
      </div>

      {/* FAQ (matches JSON-LD) */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Frequently asked</h2>
        <dl className="mt-3 space-y-4">
          {faqs.map((f) => (
            <div key={f.question}>
              <dt className="font-medium">{f.question}</dt>
              <dd className="mt-1 text-sm text-ink/70">{f.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Sibling links */}
      <section className="mt-10 grid gap-6 sm:grid-cols-2">
        {sameDevice.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink/60">
              Other {device.name} faults
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {sameDevice.map((f) => (
                <li key={f.id}>
                  <Link
                    href={`/repair/${device.id}/${f.id}`}
                    className="text-accent hover:underline"
                  >
                    {device.name} {faultNoun(f)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sameFault.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink/60">
              Same fault, other devices
            </h3>
            <ul className="mt-2 space-y-1 text-sm">
              {sameFault.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/repair/${d.id}/${fault.id}`}
                    className="text-accent hover:underline"
                  >
                    {d.name} {faultNoun(fault)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
