// Typed access layer over the hand-maintained JSON data files.
// Import from here (not the raw JSON) so consumers get full typing and helpers.

import devicesRaw from "./devices.json";
import faultsRaw from "./faults.json";
import repairCostsRaw from "./repairCosts.json";
import type {
  Category,
  CategoryDefault,
  Device,
  Fault,
  RepairCost,
} from "./types";

export * from "./types";

export const devices = devicesRaw as Device[];
export const faults = faultsRaw as Fault[];

const repairData = repairCostsRaw as {
  rows: RepairCost[];
  categoryDefaults: CategoryDefault[];
};
export const repairCosts = repairData.rows;
export const categoryDefaults = repairData.categoryDefaults;

// ---- Lookups ---------------------------------------------------------------

export function getDevice(id: string): Device | undefined {
  return devices.find((d) => d.id === id);
}

export function getFault(id: string): Fault | undefined {
  return faults.find((f) => f.id === id);
}

export function getDevicesByCategory(category: Category): Device[] {
  return devices.filter((d) => d.category === category);
}

export function getFaultsForCategory(category: Category): Fault[] {
  return faults.filter((f) => f.category.includes(category));
}

/** Faults that actually have a repair-cost row for this device. */
export function getFaultsForDevice(deviceId: string): Fault[] {
  const device = getDevice(deviceId);
  if (!device) return [];
  const ids = new Set(
    repairCosts.filter((r) => r.deviceId === deviceId).map((r) => r.faultId),
  );
  return getFaultsForCategory(device.category).filter((f) => ids.has(f.id));
}

export function getRepairCost(
  deviceId: string,
  faultId: string,
): RepairCost | undefined {
  return repairCosts.find(
    (r) => r.deviceId === deviceId && r.faultId === faultId,
  );
}

export function getCategoryDefault(
  category: Category,
  faultId: string,
): CategoryDefault | undefined {
  return categoryDefaults.find(
    (c) => c.category === category && c.faultId === faultId,
  );
}

/** Every valid device×fault pair — drives static SEO page generation. */
export function allDeviceFaultPairs(): { deviceId: string; faultId: string }[] {
  return repairCosts.map((r) => ({ deviceId: r.deviceId, faultId: r.faultId }));
}

export const brands = Array.from(new Set(devices.map((d) => d.brand))).sort();
