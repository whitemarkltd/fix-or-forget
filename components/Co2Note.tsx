import type { Category } from "@/data/types";

// Shown on repair verdicts: repairing avoids the embodied carbon of a new build.
export function Co2Note({
  category,
  co2eKg,
}: {
  category: Category;
  co2eKg: number;
}) {
  return (
    <div className="rounded-xl border border-repair/20 bg-repair-soft/50 p-4 text-sm">
      <p className="text-repair-ink">
        <span aria-hidden className="mr-1">🌱</span>
        Repairing keeps roughly <strong>{co2eKg} kg CO₂e</strong> of embodied
        carbon in use — that&apos;s the manufacturing footprint of a replacement{" "}
        {category} you won&apos;t need to build.
      </p>
      <p className="mt-1 text-xs text-repair-ink/70">
        Rough per-category estimate; real figures vary by model and source.
      </p>
    </div>
  );
}
