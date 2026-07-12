import type { VerdictMath } from "@/lib/verdict";
import { usd, usdRange } from "@/lib/format";

// The money math, shown like a receipt: labels left, mono numbers right.
export function MathReceipt({
  math,
  officialLabel = "Official repair (out of warranty)",
}: {
  math: VerdictMath;
  officialLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink/50">
        The math
      </h2>
      <dl className="divide-y divide-black/5 text-sm">
        <Row label="Independent shop repair" strong>
          {usdRange(math.independentRange)}
        </Row>
        <Row label={officialLabel} muted>
          {usdRange(math.officialRange)}
        </Row>
        {math.diyPartsRange && (
          <Row label="DIY parts only" muted>
            {usdRange(math.diyPartsRange)}
          </Row>
        )}
        <Row label="Refurbished replacement price">{usd(math.refurbishedPrice)}</Row>
        <Row label="Trade-in value (broken)" muted>
          − {usd(math.tradeInValue)}
        </Row>
        <Row label="Net cost to replace" strong>
          {usd(math.replacementCost)}
        </Row>
        <Row label="Repair-to-value ratio" muted>
          {Math.round(math.repairRatio * 100)}%
        </Row>
      </dl>
      <p className="mt-3 text-xs text-ink/45">
        Headline repair figure is the midpoint of the independent-shop range
        ({usd(math.repairCost)}). Net replacement = refurbished price − trade-in of
        your broken device.
      </p>
    </div>
  );
}

function Row({
  label,
  children,
  strong,
  muted,
}: {
  label: string;
  children: React.ReactNode;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2">
      <dt className={muted ? "text-ink/55" : "text-ink/80"}>{label}</dt>
      <dd
        className={`receipt-num ${strong ? "text-base font-semibold text-ink" : "text-ink/80"}`}
      >
        {children}
      </dd>
    </div>
  );
}
