// Central affiliate-link configuration. Every outbound commercial link is built
// here so real affiliate IDs can be dropped in via env vars later — no component
// touches a raw marketplace URL.
//
// All links should be rendered with rel="sponsored nofollow" (see AffiliateLink).

import type { Device, Fault } from "@/data/types";

// NOTE: reference `process.env.NEXT_PUBLIC_*` *directly* (never via an alias like
// `const env = process.env`). Next.js statically inlines only literal
// `process.env.NEXT_PUBLIC_FOO` reads into the client bundle; aliasing leaves a
// bare `process` reference that throws `process is not defined` in the browser.
const BACKMARKET_TAG = process.env.NEXT_PUBLIC_AFFILIATE_BACKMARKET_TAG ?? "";
const AMAZON_TAG = process.env.NEXT_PUBLIC_AFFILIATE_AMAZON_TAG ?? "";
const IFIXIT_TAG = process.env.NEXT_PUBLIC_AFFILIATE_IFIXIT_TAG ?? "";
const TRADEIN_BASE =
  process.env.NEXT_PUBLIC_AFFILIATE_TRADEIN_BASE_URL ?? "https://www.sellcell.com/search/";
const TRADEIN_TAG = process.env.NEXT_PUBLIC_AFFILIATE_TRADEIN_TAG ?? "";
const MARKETPLACE = (
  process.env.NEXT_PUBLIC_REFURB_MARKETPLACE ?? "backmarket"
).toLowerCase();

function withParam(url: string, key: string, value: string): string {
  if (!value) return url;
  const u = new URL(url);
  u.searchParams.set(key, value);
  return u.toString();
}

function q(...parts: (string | number | null | undefined)[]): string {
  return encodeURIComponent(parts.filter(Boolean).join(" "));
}

/**
 * Primary "replace" CTA destination. Prefers a device's direct Amazon affiliate
 * link (set in devices.json) and falls back to a refurbished marketplace search
 * when there isn't one.
 */
export function replacementUrl(device: Device): string {
  const direct = device.amazonUrl?.trim();
  return direct || refurbishedSearchUrl(device);
}

/** Button label matching replacementUrl's destination. */
export function replacementLabel(device: Device): string {
  return device.amazonUrl?.trim()
    ? `Buy the ${device.name} on Amazon`
    : `See refurbished ${device.name} on ${REFURB_MARKETPLACE_NAME}`;
}

/** Refurbished replacement search — Back Market (default) or Amazon Renewed. */
export function refurbishedSearchUrl(device: Device): string {
  const query = q(device.brand, device.name);
  if (MARKETPLACE === "amazon") {
    const base = `https://www.amazon.com/s?k=${query}&rh=p_n_condition-type%3A16907720011`;
    return withParam(base, "tag", AMAZON_TAG);
  }
  const base = `https://www.backmarket.com/en-us/search?q=${query}`;
  // Back Market partner links typically carry a `shopSession`/utm tag; expose it
  // generically so the owner can swap in whatever their program requires.
  return BACKMARKET_TAG ? withParam(base, "utm_source", BACKMARKET_TAG) : base;
}

/** iFixit search for DIY parts/kits for this device + fault. */
export function diyPartsUrl(device: Device, fault: Fault): string {
  const query = q(device.name, fault.label);
  const base = `https://www.ifixit.com/Search?query=${query}`;
  return IFIXIT_TAG ? withParam(base, "aff", IFIXIT_TAG) : base;
}

/** Buyback / trade-in for the broken device. */
export function tradeInUrl(device: Device): string {
  const query = q(device.brand, device.name);
  const base = TRADEIN_BASE.includes("?")
    ? `${TRADEIN_BASE}&q=${query}`
    : `${TRADEIN_BASE}?q=${query}`;
  return TRADEIN_TAG ? withParam(base, "aff", TRADEIN_TAG) : base;
}

/** "What shops charge" — a neutral, non-affiliate informational search. */
export function shopSearchUrl(device: Device, fault: Fault): string {
  const query = q(device.name, fault.label, "repair cost near me");
  return `https://www.google.com/search?q=${query}`;
}

export const REFURB_MARKETPLACE_NAME =
  MARKETPLACE === "amazon" ? "Amazon Renewed" : "Back Market";
