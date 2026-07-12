// Site-wide constants.

const DEFAULT_SITE_URL = "https://fixorforget.example.com";

/**
 * Normalise whatever NEXT_PUBLIC_SITE_URL the site owner typed into a valid
 * absolute URL. A non-developer editing an env var can easily drop the
 * scheme (e.g. "www.fixorforget.com"); `new URL()` would throw and crash the
 * whole build (see metadataBase in app/layout.tsx), so we repair it here:
 * add https:// if missing, strip any trailing slash, and fall back to the
 * default if it still can't be parsed.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return DEFAULT_SITE_URL;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withScheme).toString().replace(/\/$/, "");
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export const SITE_NAME = "Fix or Forget";
export const SITE_TAGLINE = "Repair it or replace it? Get a straight answer.";
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/**
 * The "current year" the verdict engine reasons about. Kept as a constant so
 * static SEO pages are deterministic per build (no per-request clock skew) and
 * so tests are stable. Bump this each year, or wire to new Date() if preferred.
 */
export const CURRENT_YEAR = 2026;

export const ANALYTICS_SCRIPT_URL = process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL ?? "";
export const ANALYTICS_SITE_ID = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID ?? "";
