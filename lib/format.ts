import type { PriceRange } from "@/data/types";

export function usd(n: number): string {
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function usdRange([lo, hi]: PriceRange): string {
  if (lo === hi) return usd(lo);
  return `${usd(lo)}–${usd(hi)}`;
}
