// Shared types for the /data layer. These describe the shape of the
// hand-maintained JSON files that ARE the CMS for this site.

export type Category = "phone" | "laptop";

/** The three fault "classes" used for trade-in value lookup. */
export type FaultClass = "screen" | "battery" | "other";

export type DiySkillLevel = "easy" | "moderate" | "hard" | "not-recommended";

export type Urgency = "usable" | "degraded" | "unusable";

export type Confidence = "high" | "medium" | "low";

export interface Device {
  id: string; // slug, used in URLs
  category: Category;
  brand: string;
  name: string;
  releaseYear: number;
  launchPriceUSD: number;
  refurbishedPriceUSD: number; // current typical refurbished market price
  tradeInBrokenUSD: Record<FaultClass, number>; // buyback value WITH the fault class
  supportEndYear: number; // estimated last year of OS/security updates
  successorId: string | null; // for "or upgrade to..." suggestion
  notes: string; // free text shown on device page if present
}

export interface Fault {
  id: string;
  category: Category[];
  label: string;
  faultClass: FaultClass; // maps the fault onto a trade-in value bucket
  diySkillLevel: DiySkillLevel;
  urgency: Urgency;
  descriptionShort: string;
  /**
   * A short, fault-specific sentence template used to keep programmatic SEO
   * pages from being near-duplicates. `{device}` is interpolated.
   */
  seoGuidance: string;
}

/** A [min, max] inclusive price range in USD. */
export type PriceRange = [number, number];

export interface RepairCost {
  deviceId: string;
  faultId: string;
  officialUSD: PriceRange; // manufacturer out-of-warranty range
  independentUSD: PriceRange; // typical third-party shop range
  diyPartsUSD: PriceRange | null; // parts-only, null if not DIY-recommended
  confidence: Confidence;
}

/** Category-level average repair costs, used by the generic fallback flow. */
export interface CategoryDefault {
  category: Category;
  faultId: string;
  officialUSD: PriceRange;
  independentUSD: PriceRange;
  diyPartsUSD: PriceRange | null;
  confidence: Confidence;
}
