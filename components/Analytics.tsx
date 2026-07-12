import Script from "next/script";
import { ANALYTICS_SCRIPT_URL, ANALYTICS_SITE_ID } from "@/lib/site";

// Privacy-friendly, cookieless analytics (Plausible/Umami style). Renders
// nothing unless a script URL is configured via env. No consent banner needed.
export function Analytics() {
  if (!ANALYTICS_SCRIPT_URL) return null;
  return (
    <Script
      src={ANALYTICS_SCRIPT_URL}
      data-domain={ANALYTICS_SITE_ID || undefined}
      data-website-id={ANALYTICS_SITE_ID || undefined}
      strategy="afterInteractive"
      defer
    />
  );
}
