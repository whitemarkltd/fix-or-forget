import type { Device, Fault } from "@/data/types";
import type { Verdict } from "@/lib/verdict";
import {
  replacementUrl,
  replacementLabel,
  diyPartsUrl,
  tradeInUrl,
  shopSearchUrl,
} from "@/lib/affiliates";
import { AffiliateLink, AffiliateDisclosureNote } from "./AffiliateLink";

// Action buttons vary by verdict. REPAIR -> parts + shops; REPLACE -> refurb +
// trade-in; BORDERLINE -> both sets.
export function VerdictActions({
  verdict,
  device,
  faults,
}: {
  verdict: Verdict;
  device: Device;
  faults: Fault[];
}) {
  const showRepair = verdict.lead === "repair" || verdict.lead === "both";
  const showReplace = verdict.lead === "replace" || verdict.lead === "both";
  const diyFaults = faults.filter((f) => f.diySkillLevel !== "not-recommended");
  const multiple = faults.length > 1;

  return (
    <div className="space-y-4">
      {showRepair && (
        <div className="flex flex-wrap gap-3">
          {diyFaults.map((f) => (
            <AffiliateLink key={f.id} href={diyPartsUrl(device, f)}>
              {multiple ? `DIY parts: ${f.label}` : "Find repair parts (DIY)"}
            </AffiliateLink>
          ))}
          <AffiliateLink href={shopSearchUrl(device, faults[0])} variant="secondary" affiliate={false}>
            What shops charge
          </AffiliateLink>
        </div>
      )}
      {showReplace && (
        <div className="flex flex-wrap gap-3">
          <AffiliateLink href={replacementUrl(device)}>
            {replacementLabel(device)}
          </AffiliateLink>
          <AffiliateLink href={tradeInUrl(device)} variant="secondary">
            Trade in your broken one
          </AffiliateLink>
        </div>
      )}
      <AffiliateDisclosureNote />
    </div>
  );
}
