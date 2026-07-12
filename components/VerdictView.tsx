import type { ResolvedVerdict } from "@/lib/resolveVerdict";
import { VerdictHeadline } from "./VerdictHeadline";
import { MathReceipt } from "./MathReceipt";
import { SupportBar } from "./SupportBar";
import { Co2Note } from "./Co2Note";
import { VerdictActions } from "./VerdictActions";
import { FeedbackWidget } from "./FeedbackWidget";
import { ShareButton } from "./ShareButton";

// The full "money page" verdict, in spec order:
// headline → banner → math → support bar → CO2 (repair) → actions →
// feedback → share.
export function VerdictView({ resolved }: { resolved: ResolvedVerdict }) {
  const { verdict, device, faults, generic } = resolved;
  const isRepairish =
    verdict.tone === "repair" || verdict.lead === "both" || verdict.lead === "repair";

  return (
    <div className="space-y-5">
      <VerdictHeadline verdict={verdict} />

      {faults.length > 1 && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-ink/70">
          <span className="font-medium text-ink/80">Covering {faults.length} faults:</span>{" "}
          {faults.map((f) => f.label).join(", ")}. The math below adds up the cost of
          fixing all of them.
        </div>
      )}

      {verdict.diagnosisBanner && (
        <div className="rounded-xl border border-borderline/30 bg-borderline-soft p-4 text-sm text-borderline-ink">
          <span aria-hidden className="mr-1">⚠️</span>
          {verdict.diagnosisBanner}
        </div>
      )}

      {generic && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-ink/60">
          This is a <strong>rough estimate</strong> based on your device&apos;s launch
          price and age — we don&apos;t have exact data for it. Treat the numbers as a
          ballpark and confirm with a real quote.
        </div>
      )}

      <MathReceipt math={verdict.math} />

      <SupportBar
        supportEndYear={device.supportEndYear}
        releaseYear={device.releaseYear}
      />

      {isRepairish && (
        <Co2Note category={device.category} co2eKg={verdict.math.co2eKg} />
      )}

      <div className="rounded-2xl border border-black/10 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink/50">
          Your next step
        </h2>
        <VerdictActions verdict={verdict} device={device} faults={faults} />
      </div>

      <FeedbackWidget
        context={`${device.id}/${faults.map((f) => f.id).join("+")}/${verdict.kind}`}
      />

      <div className="flex justify-center pt-2">
        <ShareButton />
      </div>
    </div>
  );
}
