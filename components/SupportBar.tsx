import { CURRENT_YEAR } from "@/lib/site";

// Visual bar for remaining software-support lifespan.
export function SupportBar({
  supportEndYear,
  releaseYear,
}: {
  supportEndYear: number;
  releaseYear: number;
}) {
  const start = releaseYear;
  const span = Math.max(supportEndYear - start, 1);
  const elapsed = Math.min(Math.max(CURRENT_YEAR - start, 0), span);
  const pct = Math.round((elapsed / span) * 100);
  const yearsLeft = supportEndYear - CURRENT_YEAR;

  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Software support
        </h2>
        <span className="text-sm text-ink/70">
          {yearsLeft > 0
            ? `updates expected until ~${supportEndYear}`
            : `updates ended ~${supportEndYear}`}
        </span>
      </div>
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full ${yearsLeft > 0 ? "bg-accent" : "bg-replace"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-ink/50">
        {yearsLeft > 0
          ? `About ${yearsLeft} year${yearsLeft === 1 ? "" : "s"} of security updates left.`
          : "No more security updates — repairs won't extend the software lifespan."}
      </p>
    </div>
  );
}
