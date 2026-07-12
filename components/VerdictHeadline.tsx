import type { Verdict } from "@/lib/verdict";

const TONE: Record<Verdict["tone"], { wrap: string; chip: string; label: string }> = {
  repair: {
    wrap: "border-repair/30 bg-repair-soft",
    chip: "bg-repair text-white",
    label: "Repair",
  },
  borderline: {
    wrap: "border-borderline/30 bg-borderline-soft",
    chip: "bg-borderline text-white",
    label: "Borderline",
  },
  replace: {
    wrap: "border-replace/30 bg-replace-soft",
    chip: "bg-replace text-white",
    label: "Replace",
  },
};

const KIND_LABEL: Record<Verdict["kind"], string> = {
  REPAIR: "Repair",
  REPAIR_LEANING: "Repair (leaning)",
  REPAIR_DIY: "Repair (DIY)",
  BORDERLINE: "Borderline",
  REPLACE: "Replace",
};

export function VerdictHeadline({ verdict }: { verdict: Verdict }) {
  const tone = TONE[verdict.tone];
  return (
    <div className={`rounded-2xl border p-5 sm:p-7 ${tone.wrap}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${tone.chip}`}
        >
          {KIND_LABEL[verdict.kind]}
        </span>
        {verdict.isRoughEstimate && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink/60">
            rough estimate
          </span>
        )}
        {verdict.confidence === "diagnosis-needed" && (
          <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-ink/60">
            diagnosis needed
          </span>
        )}
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        {verdict.headline}
      </h1>
      <p className="mt-2 text-lg text-ink/75">{verdict.reason}</p>
    </div>
  );
}
