import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  devices,
  getDevice,
  getFaultsForDevice,
  getRepairCost,
  getDevice as lookup,
} from "@/data";
import { faultNoun } from "@/lib/seo";
import { usdRange, usd } from "@/lib/format";
import { SupportBar } from "@/components/SupportBar";
import { CURRENT_YEAR } from "@/lib/site";

interface Params {
  params: { deviceId: string };
}

export const dynamicParams = false;

export function generateStaticParams() {
  return devices.map((d) => ({ deviceId: d.id }));
}

export function generateMetadata({ params }: Params): Metadata {
  const device = getDevice(params.deviceId);
  if (!device) return {};
  const title = `${device.name} — repair costs, support window & refurbished price (${CURRENT_YEAR})`;
  const description = `Everything to decide if your ${device.name} is worth fixing: repair costs for every common fault, refurbished price (~${usd(
    device.refurbishedPriceUSD,
  )}), and how long it gets updates.`;
  return {
    title,
    description,
    alternates: { canonical: `/device/${device.id}` },
    openGraph: { title, description, url: `/device/${device.id}` },
  };
}

export default function DeviceHubPage({ params }: Params) {
  const device = getDevice(params.deviceId);
  if (!device) notFound();

  const faults = getFaultsForDevice(device.id);
  const successor = device.successorId ? lookup(device.successorId) : null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <nav className="mb-4 text-xs text-ink/50">
        <Link href="/" className="hover:text-accent">Home</Link> ·{" "}
        <span className="capitalize">{device.category}</span> · {device.name}
      </nav>

      <p className="text-sm font-medium text-ink/50">{device.brand}</p>
      <h1 className="text-3xl font-bold tracking-tight">{device.name}</h1>
      <p className="mt-1 text-ink/60">
        Released {device.releaseYear} · launch price {usd(device.launchPriceUSD)} ·
        refurbished today ~{usd(device.refurbishedPriceUSD)}
      </p>
      {device.notes && (
        <p className="mt-3 rounded-lg bg-white p-3 text-sm text-ink/70">
          {device.notes}
        </p>
      )}

      <div className="mt-6">
        <SupportBar
          supportEndYear={device.supportEndYear}
          releaseYear={device.releaseYear}
        />
      </div>

      <h2 className="mt-8 text-lg font-semibold">Common faults & repair costs</h2>
      <div className="mt-3 space-y-2">
        {faults.map((f) => {
          const cost = getRepairCost(device.id, f.id);
          return (
            <Link
              key={f.id}
              href={`/repair/${device.id}/${f.id}`}
              className="flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 hover:border-accent hover:bg-accent-soft"
            >
              <span>
                <span className="font-medium">{f.label}</span>
                {cost && (
                  <span className="receipt-num block text-xs text-ink/50">
                    shop {usdRange(cost.independentUSD)}
                  </span>
                )}
              </span>
              <span aria-hidden className="text-ink/30">›</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl border border-accent/25 bg-accent-soft p-5 text-center">
        <Link
          href={`/check?device=${device.id}`}
          className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-ink"
        >
          Check my {device.name} →
        </Link>
      </div>

      {successor && (
        <p className="mt-6 text-center text-sm text-ink/60">
          Considering an upgrade?{" "}
          <Link href={`/device/${successor.id}`} className="text-accent underline">
            See the {successor.name}
          </Link>
          .
        </p>
      )}
    </div>
  );
}
