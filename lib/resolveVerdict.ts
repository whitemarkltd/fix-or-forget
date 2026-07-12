// Turns a decoded WizardState into a computed Verdict plus the device/fault
// needed to render actions. Shared by the result page and any server code.

import {
  getDevice,
  getFault,
  getRepairCost,
  getCategoryDefault,
} from "@/data";
import type { CategoryDefault, Device, Fault, RepairCost } from "@/data/types";
import {
  computeVerdictMulti,
  computeGenericVerdictMulti,
  type Verdict,
} from "./verdict";
import { CURRENT_YEAR } from "./site";
import type { WizardState } from "./wizardState";

export interface ResolvedVerdict {
  verdict: Verdict;
  /** Real device, or a synthesized stand-in for the generic flow. */
  device: Device;
  /** Every fault the user selected (one or more). */
  faults: Fault[];
  /** True when device is synthesized (generic fallback). */
  generic: boolean;
}

export type ResolveResult =
  | { ok: true; data: ResolvedVerdict }
  | { ok: false; error: string };

export function resolveVerdict(state: WizardState): ResolveResult {
  if (state.mode === "listed") {
    const device = getDevice(state.device);
    if (!device) return { ok: false, error: "Unknown device." };

    const faults: Fault[] = [];
    const costs: RepairCost[] = [];
    for (const id of state.faults) {
      const fault = getFault(id);
      if (!fault) return { ok: false, error: "Unknown fault." };
      const cost = getRepairCost(device.id, fault.id);
      if (!cost) return { ok: false, error: "No repair data for that combination." };
      faults.push(fault);
      costs.push(cost);
    }
    if (faults.length === 0) return { ok: false, error: "No fault selected." };

    const verdict = computeVerdictMulti({
      device,
      faults,
      costs,
      condition: state.cond,
      wantsDiy: state.diy,
      currentYear: CURRENT_YEAR,
    });
    return { ok: true, data: { verdict, device, faults, generic: false } };
  }

  // Generic fallback.
  const faults: Fault[] = [];
  const categoryDefaults: CategoryDefault[] = [];
  for (const id of state.faults) {
    const fault = getFault(id);
    if (!fault) return { ok: false, error: "Unknown fault." };
    if (!fault.category.includes(state.category)) {
      return { ok: false, error: "That fault doesn't apply to this device type." };
    }
    const categoryDefault = getCategoryDefault(state.category, fault.id);
    if (!categoryDefault) {
      return { ok: false, error: "No default cost for that combination." };
    }
    faults.push(fault);
    categoryDefaults.push(categoryDefault);
  }
  if (faults.length === 0) return { ok: false, error: "No fault selected." };

  const verdict = computeGenericVerdictMulti({
    category: state.category,
    launchPriceUSD: state.price,
    ageYears: state.age,
    faults,
    categoryDefaults,
    condition: state.cond,
    wantsDiy: state.diy,
    currentYear: CURRENT_YEAR,
  });

  // Synthesize a device for affiliate links + display.
  const word = state.category === "phone" ? "phone" : "laptop";
  const device: Device = {
    id: "generic",
    category: state.category,
    brand: "",
    name: `your ${word}`,
    releaseYear: CURRENT_YEAR - state.age,
    launchPriceUSD: state.price,
    refurbishedPriceUSD: verdict.math.refurbishedPrice,
    tradeInBrokenUSD: {
      screen: verdict.math.tradeInValue,
      battery: verdict.math.tradeInValue,
      other: verdict.math.tradeInValue,
    },
    supportEndYear: CURRENT_YEAR + verdict.math.yearsLeft,
    successorId: null,
    notes: "",
  };
  return { ok: true, data: { verdict, device, faults, generic: true } };
}
