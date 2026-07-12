import { describe, it, expect } from "vitest";
import {
  computeVerdict,
  computeVerdictMulti,
  computeGenericVerdict,
  combineCostRanges,
  combineFaults,
  estimateEffectiveValue,
  midpoint,
  CONDITION_FACTOR,
  type ComputeInput,
} from "./verdict";
import type { Device, Fault, RepairCost, CategoryDefault } from "@/data/types";

// ---- Fixtures ---------------------------------------------------------------

const baseDevice: Device = {
  id: "test-phone",
  category: "phone",
  brand: "TestCo",
  name: "Test Phone",
  releaseYear: 2022,
  launchPriceUSD: 800,
  refurbishedPriceUSD: 400,
  tradeInBrokenUSD: { screen: 100, battery: 150, other: 60 },
  supportEndYear: 2030,
  successorId: null,
  notes: "",
};

const screenFault: Fault = {
  id: "screen",
  category: ["phone"],
  label: "Cracked or broken screen",
  faultClass: "screen",
  diySkillLevel: "hard",
  urgency: "degraded",
  descriptionShort: "",
  seoGuidance: "",
};

const wontTurnOnFault: Fault = {
  id: "wont-turn-on",
  category: ["phone"],
  label: "Won't turn on",
  faultClass: "other",
  diySkillLevel: "not-recommended",
  urgency: "unusable",
  descriptionShort: "",
  seoGuidance: "",
};

function cost(overrides: Partial<RepairCost> = {}): RepairCost {
  return {
    deviceId: "test-phone",
    faultId: "screen",
    officialUSD: [200, 260],
    independentUSD: [100, 140],
    diyPartsUSD: [80, 120],
    confidence: "high",
    ...overrides,
  };
}

function input(overrides: Partial<ComputeInput> = {}): ComputeInput {
  return {
    device: baseDevice,
    fault: screenFault,
    cost: cost(),
    condition: "good",
    wantsDiy: false,
    currentYear: 2026,
    ...overrides,
  };
}

// ---- midpoint ---------------------------------------------------------------

describe("midpoint", () => {
  it("rounds the average of a range", () => {
    expect(midpoint([100, 140])).toBe(120);
    expect(midpoint([45, 75])).toBe(60);
  });
});

// ---- Rule 1: no support left -> REPLACE ------------------------------------

describe("Rule 1 — support window expired", () => {
  it("returns REPLACE when yearsLeft <= 0 even if repair would be cheap", () => {
    const v = computeVerdict(
      input({
        device: { ...baseDevice, supportEndYear: 2025 }, // yearsLeft = -1
        cost: cost({ independentUSD: [20, 30] }), // very cheap repair
      }),
    );
    expect(v.kind).toBe("REPLACE");
    expect(v.tone).toBe("replace");
    expect(v.reason).toContain("2025");
  });

  it("treats yearsLeft == 0 as expired", () => {
    const v = computeVerdict(
      input({ device: { ...baseDevice, supportEndYear: 2026 } }),
    );
    expect(v.kind).toBe("REPLACE");
  });
});

// ---- Rule 2: strong repair --------------------------------------------------

describe("Rule 2 — strong repair", () => {
  it("REPAIR when ratio < 0.30 and >= 2 years left", () => {
    // repairCost=60, effectiveValue=400 => ratio 0.15
    const v = computeVerdict(
      input({ cost: cost({ independentUSD: [50, 70] }) }),
    );
    expect(v.kind).toBe("REPAIR");
    expect(v.tone).toBe("repair");
    expect(v.math.repairRatio).toBeCloseTo(0.15, 2);
  });
});

// ---- Rule 3: leaning repair -------------------------------------------------

describe("Rule 3 — leaning repair (1 year left)", () => {
  it("REPAIR_LEANING when ratio < 0.30 and exactly 1 year left", () => {
    const v = computeVerdict(
      input({
        device: { ...baseDevice, supportEndYear: 2027 }, // yearsLeft = 1
        cost: cost({ independentUSD: [50, 70] }),
      }),
    );
    expect(v.kind).toBe("REPAIR_LEANING");
    expect(v.reason).toContain("2027");
  });
});

// ---- Rule 4: borderline -----------------------------------------------------

describe("Rule 4 — borderline", () => {
  it("BORDERLINE when 0.30 <= ratio <= 0.60, leading with cheaper path", () => {
    // repairCost=160, effectiveValue=400 => ratio 0.40
    // replacementCost = 400 - 100(screen) = 300; repair(160) cheaper
    const v = computeVerdict(
      input({ cost: cost({ independentUSD: [150, 170] }) }),
    );
    expect(v.kind).toBe("BORDERLINE");
    expect(v.tone).toBe("borderline");
    expect(v.lead).toBe("both");
    expect(v.reason.toLowerCase()).toContain("repair");
  });

  it("boundary at exactly 0.30 is BORDERLINE (inclusive)", () => {
    // repairCost=120, effectiveValue=400 => ratio 0.30
    const v = computeVerdict(
      input({ cost: cost({ independentUSD: [110, 130] }) }),
    );
    expect(v.math.repairRatio).toBeCloseTo(0.3, 2);
    expect(v.kind).toBe("BORDERLINE");
  });

  it("leads with replacement when replacement is cheaper", () => {
    // Make trade-in high so replacement net is very low.
    const v = computeVerdict(
      input({
        device: { ...baseDevice, tradeInBrokenUSD: { screen: 320, battery: 150, other: 60 } },
        cost: cost({ independentUSD: [150, 170] }), // repair 160
      }),
    );
    // replacementCost = 400 - 320 = 80 < repair 160
    expect(v.kind).toBe("BORDERLINE");
    expect(v.reason.toLowerCase()).toContain("replacing");
  });
});

// ---- Rule 5: replace, unless DIY rescues -----------------------------------

describe("Rule 5 — replace / DIY rescue", () => {
  it("REPLACE when ratio > 0.60 and no DIY", () => {
    // repairCost=280, effectiveValue=400 => ratio 0.70
    const v = computeVerdict(
      input({ cost: cost({ independentUSD: [270, 290] }) }),
    );
    expect(v.kind).toBe("REPLACE");
    expect(v.tone).toBe("replace");
  });

  it("REPAIR_DIY when DIY selected and DIY ratio < 0.30", () => {
    // shop repair 280 -> ratio 0.70 (replace), but diy midpoint 100 -> 0.25
    const v = computeVerdict(
      input({
        wantsDiy: true,
        cost: cost({ independentUSD: [270, 290], diyPartsUSD: [90, 110] }),
      }),
    );
    expect(v.kind).toBe("REPAIR_DIY");
    expect(v.reason).toContain("DIY");
    expect(v.reason).toContain("hard"); // skill-level warning
  });

  it("stays REPLACE if DIY selected but DIY ratio still >= 0.30", () => {
    const v = computeVerdict(
      input({
        wantsDiy: true,
        cost: cost({ independentUSD: [270, 290], diyPartsUSD: [140, 160] }), // 150 -> 0.375
      }),
    );
    expect(v.kind).toBe("REPLACE");
  });

  it("does not apply DIY rescue when user did not opt into DIY", () => {
    const v = computeVerdict(
      input({
        wantsDiy: false,
        cost: cost({ independentUSD: [270, 290], diyPartsUSD: [90, 110] }),
      }),
    );
    expect(v.kind).toBe("REPLACE");
  });
});

// ---- Rule 6: diagnosis-needed faults ---------------------------------------

describe("Rule 6 — diagnosis-needed cap", () => {
  it("caps confidence and adds a banner for wont-turn-on", () => {
    const v = computeVerdict(
      input({
        fault: wontTurnOnFault,
        cost: cost({ faultId: "wont-turn-on", diyPartsUSD: null, confidence: "high" }),
      }),
    );
    expect(v.confidence).toBe("diagnosis-needed");
    expect(v.diagnosisBanner).toBeTruthy();
    expect(v.diagnosisBanner).toContain("diagnos");
  });

  it("no banner for a normal fault", () => {
    const v = computeVerdict(input());
    expect(v.diagnosisBanner).toBeNull();
    expect(v.confidence).toBe("high");
  });
});

// ---- condition factor affects the ratio ------------------------------------

describe("condition factor", () => {
  it("poor condition raises the repair ratio (lowers effective value)", () => {
    const good = computeVerdict(input({ condition: "good" }));
    const poor = computeVerdict(input({ condition: "poor" }));
    expect(poor.math.repairRatio).toBeGreaterThan(good.math.repairRatio);
    expect(poor.math.conditionFactor).toBe(CONDITION_FACTOR.poor);
  });
});

// ---- Generic fallback -------------------------------------------------------

const catDefault: CategoryDefault = {
  category: "phone",
  faultId: "screen",
  officialUSD: [180, 280],
  independentUSD: [100, 160],
  diyPartsUSD: [70, 110],
  confidence: "low",
};

describe("estimateEffectiveValue", () => {
  it("applies compounding depreciation with a floor", () => {
    const { refurbished } = estimateEffectiveValue("phone", 800, 2, 1);
    // 800 * 0.65^2 = 338
    expect(refurbished).toBe(338);
  });

  it("never drops below the category floor", () => {
    const { refurbished } = estimateEffectiveValue("phone", 800, 20, 1);
    expect(refurbished).toBe(80); // floor 10% of 800
  });

  it("laptop uses a gentler curve", () => {
    const phone = estimateEffectiveValue("phone", 1000, 3, 1).refurbished;
    const laptop = estimateEffectiveValue("laptop", 1000, 3, 1).refurbished;
    expect(laptop).toBeGreaterThan(phone);
  });
});

describe("computeGenericVerdict", () => {
  it("produces a rough-estimate verdict for an unlisted device", () => {
    const v = computeGenericVerdict({
      category: "phone",
      launchPriceUSD: 800,
      ageYears: 2,
      fault: screenFault,
      categoryDefault: catDefault,
      condition: "good",
      wantsDiy: false,
      currentYear: 2026,
    });
    expect(v.isRoughEstimate).toBe(true);
    expect(v.confidence).toBe("low");
    expect(v.headline.toLowerCase()).toContain("phone");
    expect(["REPAIR", "REPAIR_LEANING", "REPAIR_DIY", "BORDERLINE", "REPLACE"]).toContain(
      v.kind,
    );
  });

  it("an old unlisted device with no support left is REPLACE", () => {
    const v = computeGenericVerdict({
      category: "phone",
      launchPriceUSD: 800,
      ageYears: 8, // support span 5 => supportEndYear in the past
      fault: screenFault,
      categoryDefault: catDefault,
      condition: "worn",
      wantsDiy: false,
      currentYear: 2026,
    });
    expect(v.kind).toBe("REPLACE");
  });
});

// ---- Combining multiple faults ---------------------------------------------

const batteryFault: Fault = {
  id: "battery",
  category: ["phone"],
  label: "Battery drains fast",
  faultClass: "battery",
  diySkillLevel: "moderate",
  urgency: "degraded",
  descriptionShort: "",
  seoGuidance: "",
};

function screenCost(overrides: Partial<RepairCost> = {}): RepairCost {
  return {
    deviceId: "test-phone",
    faultId: "screen",
    officialUSD: [200, 260],
    independentUSD: [90, 110], // mid 100
    diyPartsUSD: [60, 80], // mid 70
    confidence: "high",
    ...overrides,
  };
}

function batteryCost(overrides: Partial<RepairCost> = {}): RepairCost {
  return {
    deviceId: "test-phone",
    faultId: "battery",
    officialUSD: [80, 100],
    independentUSD: [40, 60], // mid 50
    diyPartsUSD: [20, 40], // mid 30
    confidence: "medium",
    ...overrides,
  };
}

describe("combineCostRanges", () => {
  it("sums each range and takes the lowest confidence", () => {
    const c = combineCostRanges([screenCost(), batteryCost()]);
    expect(c.officialUSD).toEqual([280, 360]);
    expect(c.independentUSD).toEqual([130, 170]);
    expect(c.diyPartsUSD).toEqual([80, 120]);
    expect(c.confidence).toBe("medium"); // min(high, medium)
  });

  it("drops DIY entirely if any fault has no DIY option", () => {
    const c = combineCostRanges([screenCost(), batteryCost({ diyPartsUSD: null })]);
    expect(c.diyPartsUSD).toBeNull();
  });
});

describe("combineFaults", () => {
  it("picks the worst (lowest) trade-in class among the faults", () => {
    // baseDevice trade-in: screen 100, battery 150, other 60
    const f = combineFaults([screenFault, batteryFault], baseDevice.tradeInBrokenUSD);
    expect(f.faultClass).toBe("screen"); // 100 < 150
  });

  it("forces the diagnosis path if any fault needs diagnosis", () => {
    const f = combineFaults([batteryFault, wontTurnOnFault], baseDevice.tradeInBrokenUSD);
    expect(f.id).toBe("wont-turn-on");
  });
});

describe("computeVerdictMulti", () => {
  it("adds up repair costs across faults into one verdict", () => {
    // screen 100 + battery 50 = 150 repair; effectiveValue 400 => ratio 0.375
    const v = computeVerdictMulti({
      device: baseDevice,
      faults: [screenFault, batteryFault],
      costs: [screenCost(), batteryCost()],
      condition: "good",
      wantsDiy: false,
      currentYear: 2026,
    });
    expect(v.math.repairCost).toBe(150);
    expect(v.math.repairRatio).toBe(0.38); // 150/400, rounded to 2dp by the engine
    expect(v.kind).toBe("BORDERLINE");
  });

  it("a single fault matches the single-fault engine exactly", () => {
    const solo = computeVerdict(input({ cost: screenCost() }));
    const multi = computeVerdictMulti({
      device: baseDevice,
      faults: [screenFault],
      costs: [screenCost()],
      condition: "good",
      wantsDiy: false,
      currentYear: 2026,
    });
    expect(multi.kind).toBe(solo.kind);
    expect(multi.math.repairCost).toBe(solo.math.repairCost);
    expect(multi.math.repairRatio).toBe(solo.math.repairRatio);
  });

  it("two cheap faults can still tip from REPAIR to REPLACE once summed", () => {
    // Each alone: 150 => ratio 0.375 (borderline). Summed 300 => ratio 0.75 => REPLACE.
    const pricey = screenCost({ independentUSD: [140, 160] }); // mid 150
    const v = computeVerdictMulti({
      device: baseDevice,
      faults: [screenFault, batteryFault],
      costs: [pricey, batteryCost({ independentUSD: [140, 160] })],
      condition: "good",
      wantsDiy: false,
      currentYear: 2026,
    });
    expect(v.math.repairCost).toBe(300);
    expect(v.kind).toBe("REPLACE");
  });
});
