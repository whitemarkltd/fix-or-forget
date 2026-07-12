// The verdict engine. Pure, deterministic, fully unit-tested.
// Given a device + fault + condition (or a generic-fallback description),
// it returns a Verdict object with the full math the UI renders as a receipt.

import type {
  CategoryDefault,
  Category,
  Confidence,
  Device,
  DiySkillLevel,
  Fault,
  FaultClass,
  PriceRange,
  RepairCost,
} from "@/data/types";

export type VerdictKind =
  | "REPAIR"
  | "REPAIR_LEANING"
  | "REPAIR_DIY"
  | "BORDERLINE"
  | "REPLACE";

export type Condition = "good" | "worn" | "poor";

export const CONDITION_FACTOR: Record<Condition, number> = {
  good: 1.0,
  worn: 0.85,
  poor: 0.65,
};

/** Embodied-carbon estimates per category (kg CO2e). Rough, sourced footnote. */
export const CO2E_KG: Record<Category, number> = {
  phone: 50,
  laptop: 250,
};

export interface VerdictMath {
  repairCost: number; // midpoint of independent range — the headline number
  officialRange: PriceRange;
  independentRange: PriceRange;
  diyPartsRange: PriceRange | null;
  diyMidpoint: number | null;
  refurbishedPrice: number;
  tradeInValue: number;
  replacementCost: number; // net cost of replacing (refurb − trade-in)
  conditionFactor: number;
  effectiveValue: number; // refurb × condition factor
  repairRatio: number; // repairCost / effectiveValue
  yearsLeft: number;
  co2eKg: number;
}

export interface Verdict {
  kind: VerdictKind;
  headline: string;
  reason: string;
  /** Which path we lead with visually. */
  lead: "repair" | "replace" | "both";
  /** Color token / verdict family for styling. */
  tone: "repair" | "borderline" | "replace";
  confidence: Confidence | "diagnosis-needed";
  /** Banner text for diagnosis-needed faults, else null. */
  diagnosisBanner: string | null;
  /** True when this came from the generic (unlisted device) fallback. */
  isRoughEstimate: boolean;
  math: VerdictMath;
}

export function midpoint([lo, hi]: PriceRange): number {
  return Math.round((lo + hi) / 2);
}

const DIAGNOSIS_FAULTS = new Set(["wont-turn-on", "water-damage"]);

// ---- Combining multiple selected faults ------------------------------------
// A user can pick several faults at once ("cracked screen AND dead battery").
// We collapse them into one synthetic fault + cost so the multi-fault case
// flows through the exact same rule engine as a single fault: costs sum,
// trade-in tracks the most-damaging fault, DIY is only offered when every
// fault is DIY-able, a diagnosis-needed fault anywhere forces the diagnosis
// path, and confidence is the lowest of the set.

const CONFIDENCE_RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };
const SKILL_RANK: Record<DiySkillLevel, number> = {
  easy: 0,
  moderate: 1,
  hard: 2,
  "not-recommended": 3,
};

/** Relative trade-in weighting per fault class for the generic (unlisted) flow. */
export const GENERIC_TRADEIN_FACTOR: Record<FaultClass, number> = {
  screen: 1,
  battery: 1.3,
  other: 0.7,
};

interface CostRanges {
  officialUSD: PriceRange;
  independentUSD: PriceRange;
  diyPartsUSD: PriceRange | null;
  confidence: Confidence;
}

function sumRanges(ranges: PriceRange[]): PriceRange {
  return ranges.reduce<PriceRange>(([lo, hi], [l, h]) => [lo + l, hi + h], [0, 0]);
}

/** Sum a set of cost rows into one combined cost (used for multi-fault repairs). */
export function combineCostRanges(costs: CostRanges[]): CostRanges {
  const everyDiy = costs.every((c) => c.diyPartsUSD != null);
  return {
    officialUSD: sumRanges(costs.map((c) => c.officialUSD)),
    independentUSD: sumRanges(costs.map((c) => c.independentUSD)),
    // Only offer a DIY total when *every* selected fault can be DIY'd — you
    // can't half-DIY a repair.
    diyPartsUSD: everyDiy
      ? sumRanges(costs.map((c) => c.diyPartsUSD as PriceRange))
      : null,
    confidence: costs.reduce<Confidence>(
      (worst, c) =>
        CONFIDENCE_RANK[c.confidence] < CONFIDENCE_RANK[worst] ? c.confidence : worst,
      "high",
    ),
  };
}

/**
 * Collapse several faults into one synthetic fault for the rule engine.
 * `tradeIn` (the device's per-class trade-in values, or the generic factors)
 * decides which class is "worst" — the device is worth its most-damaged part.
 */
export function combineFaults(
  faults: Fault[],
  tradeIn: Record<FaultClass, number>,
): Fault {
  const worstClass = faults.reduce<FaultClass>(
    (worst, f) => (tradeIn[f.faultClass] < tradeIn[worst] ? f.faultClass : worst),
    faults[0].faultClass,
  );
  const diagnosisFault = faults.find((f) => DIAGNOSIS_FAULTS.has(f.id));
  const hardest = faults.reduce((h, f) =>
    SKILL_RANK[f.diySkillLevel] > SKILL_RANK[h.diySkillLevel] ? f : h,
  );
  return {
    ...faults[0],
    id: diagnosisFault ? diagnosisFault.id : faults[0].id,
    faultClass: worstClass,
    diySkillLevel: hardest.diySkillLevel,
  };
}

// ---- Listed-device verdict --------------------------------------------------

export interface ComputeInput {
  device: Device;
  fault: Fault;
  cost: RepairCost;
  condition: Condition;
  wantsDiy: boolean;
  currentYear: number;
}

export function computeVerdict(input: ComputeInput): Verdict {
  const { device, fault, cost, condition, wantsDiy, currentYear } = input;

  const repairCost = midpoint(cost.independentUSD);
  const tradeInValue = device.tradeInBrokenUSD[fault.faultClass];
  const refurbishedPrice = device.refurbishedPriceUSD;
  const replacementCost = Math.max(refurbishedPrice - tradeInValue, 0);
  const conditionFactor = CONDITION_FACTOR[condition];
  const effectiveValue = refurbishedPrice * conditionFactor;
  const repairRatio = effectiveValue > 0 ? repairCost / effectiveValue : Infinity;
  const yearsLeft = device.supportEndYear - currentYear;

  const diyMidpoint = cost.diyPartsUSD ? midpoint(cost.diyPartsUSD) : null;
  const diyRatio =
    diyMidpoint != null && effectiveValue > 0
      ? diyMidpoint / effectiveValue
      : null;

  const math: VerdictMath = {
    repairCost,
    officialRange: cost.officialUSD,
    independentRange: cost.independentUSD,
    diyPartsRange: cost.diyPartsUSD,
    diyMidpoint,
    refurbishedPrice,
    tradeInValue,
    replacementCost,
    conditionFactor,
    effectiveValue: Math.round(effectiveValue),
    repairRatio: round2(repairRatio),
    yearsLeft,
    co2eKg: CO2E_KG[device.category],
  };

  const diagnosisNeeded = DIAGNOSIS_FAULTS.has(fault.id);
  const diagnosisBanner = diagnosisNeeded
    ? "The costs shown are a range pending diagnosis — many shops diagnose this for free before you commit to anything."
    : null;
  const baseConfidence: Verdict["confidence"] = diagnosisNeeded
    ? "diagnosis-needed"
    : cost.confidence;

  const base = {
    lead: "repair" as const,
    tone: "repair" as const,
    confidence: baseConfidence,
    diagnosisBanner,
    isRoughEstimate: false,
    math,
  };

  // Rule 1: no support left → REPLACE.
  if (yearsLeft <= 0) {
    return {
      ...base,
      kind: "REPLACE",
      tone: "replace",
      lead: "replace",
      headline: `Replace your ${device.name}`,
      reason: `It stopped getting security updates in ${device.supportEndYear}, so a repair buys you a device that's already end-of-life.`,
    };
  }

  // Rule 2: strong repair.
  if (repairRatio < 0.3 && yearsLeft >= 2) {
    return {
      ...base,
      kind: "REPAIR",
      headline: `Repair your ${device.name}`,
      reason: `The fix costs about ${pct(repairRatio)} of what the device is worth, and it still gets updates until ~${device.supportEndYear}.`,
    };
  }

  // Rule 3: leaning repair, one year of support left.
  if (repairRatio < 0.3 && yearsLeft === 1) {
    return {
      ...base,
      kind: "REPAIR_LEANING",
      headline: `Repair your ${device.name} — for now`,
      reason: `The repair is cheap relative to the device's value, but updates are expected to end around ${device.supportEndYear}, so plan to replace within a year.`,
    };
  }

  // Rule 4: borderline — lead with the cheaper 2-year path.
  if (repairRatio >= 0.3 && repairRatio <= 0.6) {
    const repairIsCheaper = repairCost <= replacementCost;
    return {
      ...base,
      kind: "BORDERLINE",
      tone: "borderline",
      lead: "both",
      headline: `It's a close call for your ${device.name}`,
      reason: repairIsCheaper
        ? `Repairing (~$${repairCost}) works out cheaper than replacing (~$${replacementCost} net), so repair has a slight edge — but both are reasonable.`
        : `Replacing (~$${replacementCost} net after trade-in) works out cheaper than repairing (~$${repairCost}), so replacement has a slight edge — but both are reasonable.`,
    };
  }

  // Rule 5: repairRatio > 0.60 → REPLACE, unless DIY rescues it.
  if (wantsDiy && diyRatio != null && diyRatio < 0.3) {
    return {
      ...base,
      kind: "REPAIR_DIY",
      headline: `Repair your ${device.name} yourself`,
      reason: `A shop repair isn't worth it, but DIY parts (~$${diyMidpoint}) bring the cost under a third of the device's value. Note: this is a "${fault.diySkillLevel}" repair — attempt only if you're comfortable.`,
    };
  }

  return {
    ...base,
    kind: "REPLACE",
    tone: "replace",
    lead: "replace",
    headline: `Replace your ${device.name}`,
    reason: `The repair costs about ${pct(repairRatio)} of what the device is worth — past that point a refurbished replacement is the smarter money.`,
  };
}

export interface MultiComputeInput {
  device: Device;
  /** One or more selected faults, with their matching cost rows (same length). */
  faults: Fault[];
  costs: RepairCost[];
  condition: Condition;
  wantsDiy: boolean;
  currentYear: number;
}

/** Listed-device verdict for one or more faults, combined into one total. */
export function computeVerdictMulti(input: MultiComputeInput): Verdict {
  const { device, faults, costs, condition, wantsDiy, currentYear } = input;
  const fault = combineFaults(faults, device.tradeInBrokenUSD);
  const ranges = combineCostRanges(costs);
  const cost: RepairCost = {
    deviceId: device.id,
    faultId: fault.id,
    ...ranges,
  };
  return computeVerdict({ device, fault, cost, condition, wantsDiy, currentYear });
}

// ---- Generic fallback (device not listed) ----------------------------------

export interface GenericInput {
  category: Category;
  launchPriceUSD: number;
  ageYears: number;
  fault: Fault;
  categoryDefault: CategoryDefault;
  condition: Condition;
  wantsDiy: boolean;
  currentYear: number;
  /** Assumed support lifespan from release, per category. */
  supportSpanYears?: number;
}

const DEPRECIATION: Record<Category, { rate: number; floor: number }> = {
  phone: { rate: 0.35, floor: 0.1 },
  laptop: { rate: 0.28, floor: 0.12 },
};

const DEFAULT_SUPPORT_SPAN: Record<Category, number> = {
  phone: 5,
  laptop: 8,
};

/** Depreciated value estimate for an unlisted device. */
export function estimateEffectiveValue(
  category: Category,
  launchPriceUSD: number,
  ageYears: number,
  conditionFactor: number,
): { refurbished: number; effectiveValue: number } {
  const { rate, floor } = DEPRECIATION[category];
  const depreciated = launchPriceUSD * Math.pow(1 - rate, Math.max(ageYears, 0));
  const floored = Math.max(depreciated, launchPriceUSD * floor);
  return {
    refurbished: Math.round(floored),
    effectiveValue: Math.round(floored * conditionFactor),
  };
}

export function computeGenericVerdict(input: GenericInput): Verdict {
  const {
    category,
    launchPriceUSD,
    ageYears,
    fault,
    categoryDefault,
    condition,
    wantsDiy,
    currentYear,
    supportSpanYears = DEFAULT_SUPPORT_SPAN[category],
  } = input;

  const conditionFactor = CONDITION_FACTOR[condition];
  const { refurbished, effectiveValue } = estimateEffectiveValue(
    category,
    launchPriceUSD,
    ageYears,
    conditionFactor,
  );

  // Reuse the listed-device engine with a synthesized device + cost row so the
  // rules stay in one place.
  const supportEndYear = currentYear - Math.max(ageYears, 0) + supportSpanYears;

  // Trade-in of an unlisted broken device is unknown; estimate ~18% of refurb.
  const estTradeIn = Math.round(refurbished * 0.18);

  const synthDevice: Device = {
    id: "generic",
    category,
    brand: "",
    name: category === "phone" ? "phone" : "laptop",
    releaseYear: currentYear - Math.max(ageYears, 0),
    launchPriceUSD,
    refurbishedPriceUSD: refurbished,
    tradeInBrokenUSD: {
      screen: Math.round(estTradeIn * GENERIC_TRADEIN_FACTOR.screen),
      battery: Math.round(estTradeIn * GENERIC_TRADEIN_FACTOR.battery),
      other: Math.round(estTradeIn * GENERIC_TRADEIN_FACTOR.other),
    },
    supportEndYear,
    successorId: null,
    notes: "",
  };

  const synthCost: RepairCost = {
    deviceId: "generic",
    faultId: fault.id,
    officialUSD: categoryDefault.officialUSD,
    independentUSD: categoryDefault.independentUSD,
    diyPartsUSD: categoryDefault.diyPartsUSD,
    confidence: "low",
  };

  const verdict = computeVerdict({
    device: synthDevice,
    fault,
    cost: synthCost,
    condition,
    wantsDiy,
    currentYear,
  });

  // Override naming + flag as a rough estimate.
  const deviceWord = category === "phone" ? "phone" : "laptop";
  return {
    ...verdict,
    isRoughEstimate: true,
    confidence: verdict.confidence === "diagnosis-needed" ? "diagnosis-needed" : "low",
    headline: verdict.headline.replace(synthDevice.name, `your ${deviceWord}`),
    math: {
      ...verdict.math,
      effectiveValue,
    },
  };
}

export interface GenericMultiInput {
  category: Category;
  launchPriceUSD: number;
  ageYears: number;
  faults: Fault[];
  categoryDefaults: CategoryDefault[];
  condition: Condition;
  wantsDiy: boolean;
  currentYear: number;
  supportSpanYears?: number;
}

/** Generic (unlisted device) verdict for one or more faults, combined. */
export function computeGenericVerdictMulti(input: GenericMultiInput): Verdict {
  const { faults, categoryDefaults, ...rest } = input;
  const fault = combineFaults(faults, GENERIC_TRADEIN_FACTOR);
  const ranges = combineCostRanges(categoryDefaults);
  const categoryDefault: CategoryDefault = {
    category: input.category,
    faultId: fault.id,
    ...ranges,
  };
  return computeGenericVerdict({ ...rest, fault, categoryDefault });
}

// ---- helpers ---------------------------------------------------------------

function round2(n: number): number {
  if (!isFinite(n)) return n;
  return Math.round(n * 100) / 100;
}

function pct(ratio: number): string {
  if (!isFinite(ratio)) return "an unclear share";
  return `${Math.round(ratio * 100)}%`;
}
