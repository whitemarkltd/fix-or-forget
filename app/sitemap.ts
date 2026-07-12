import type { MetadataRoute } from "next";
import { devices, allDeviceFaultPairs } from "@/data";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const abs = (path: string) => `${SITE_URL}${path}`;

  const staticRoutes = [
    "/",
    "/check",
    "/about",
    "/how-it-works",
    "/affiliate-disclosure",
    "/privacy",
  ].map((p) => ({
    url: abs(p),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: p === "/" ? 1 : 0.6,
  }));

  const deviceRoutes = devices.map((d) => ({
    url: abs(`/device/${d.id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const repairRoutes = allDeviceFaultPairs().map(({ deviceId, faultId }) => ({
    url: abs(`/repair/${deviceId}/${faultId}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...deviceRoutes, ...repairRoutes];
}
