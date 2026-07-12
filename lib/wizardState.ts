// Encoding/decoding of wizard state to/from URL query params so every verdict
// URL is shareable and reproducible. Two flavours:
//   - listed device:   ?device=iphone-13&fault=screen,battery&cond=good&diy=1
//   - generic fallback: ?generic=1&cat=phone&price=800&age=3&fault=battery&cond=worn
//
// `fault` holds one or more fault ids, comma-separated. A single value
// (`fault=battery`) still decodes, so older shared links keep working.

import type { Category } from "@/data/types";
import type { Condition } from "./verdict";

export interface ListedState {
  mode: "listed";
  device: string;
  faults: string[];
  cond: Condition;
  diy: boolean;
}

export interface GenericState {
  mode: "generic";
  category: Category;
  price: number;
  age: number;
  faults: string[];
  cond: Condition;
  diy: boolean;
}

export type WizardState = ListedState | GenericState;

const CONDITIONS: Condition[] = ["good", "worn", "poor"];
const CATEGORIES: Category[] = ["phone", "laptop"];

function asCondition(v: string | null): Condition {
  return CONDITIONS.includes(v as Condition) ? (v as Condition) : "good";
}

export function encodeState(state: WizardState): string {
  const p = new URLSearchParams();
  if (state.mode === "generic") {
    p.set("generic", "1");
    p.set("cat", state.category);
    p.set("price", String(state.price));
    p.set("age", String(state.age));
  } else {
    p.set("device", state.device);
  }
  p.set("fault", state.faults.join(","));
  p.set("cond", state.cond);
  if (state.diy) p.set("diy", "1");
  return p.toString();
}

export function resultHref(state: WizardState): string {
  return `/check/result?${encodeState(state)}`;
}

/** Parse from a URLSearchParams-like record. Returns null if incomplete. */
export function decodeState(
  params: URLSearchParams | Record<string, string | string[] | undefined>,
): WizardState | null {
  const get = (k: string): string | null => {
    if (params instanceof URLSearchParams) return params.get(k);
    const v = params[k];
    return Array.isArray(v) ? (v[0] ?? null) : (v ?? null);
  };

  const faults = (get("fault") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (faults.length === 0) return null;
  const cond = asCondition(get("cond"));
  const diy = get("diy") === "1";

  if (get("generic") === "1") {
    const cat = get("cat");
    if (!CATEGORIES.includes(cat as Category)) return null;
    const price = Number(get("price"));
    const age = Number(get("age"));
    if (!Number.isFinite(price) || price <= 0) return null;
    if (!Number.isFinite(age) || age < 0) return null;
    return {
      mode: "generic",
      category: cat as Category,
      price,
      age,
      faults,
      cond,
      diy,
    };
  }

  const device = get("device");
  if (!device) return null;
  return { mode: "listed", device, faults, cond, diy };
}
