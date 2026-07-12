// Site-wide constants.

export const SITE_NAME = "Fix or Ditch";
export const SITE_TAGLINE = "Repair it or replace it? Get a straight answer.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixorditch.example.com";

/**
 * The "current year" the verdict engine reasons about. Kept as a constant so
 * static SEO pages are deterministic per build (no per-request clock skew) and
 * so tests are stable. Bump this each year, or wire to new Date() if preferred.
 */
export const CURRENT_YEAR = 2026;

export const ANALYTICS_SCRIPT_URL = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL ?? "";
export const ANALYTICS_SITE_ID = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? "";
