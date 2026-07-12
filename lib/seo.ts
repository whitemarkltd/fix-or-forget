// Content assembly for the programmatic SEO pages. Sentences are built from
// data fields + per-fault templates so pages aren't near-duplicates.

import type { Device, Fault, RepairCost } from "@/data/types";
import { computeVerdict, midpoint, type Verdict } from "./verdict";
import { CURRENT_YEAR, SITE_NAME, SITE_URL } from "./site";
import { usdRange, usd } from "./format";

export interface FaqItem {
  question: string;
  answer: string;
}

/** A "typical case": good condition, shop repair (no DIY). */
export function typicalVerdict(
  device: Device,
  fault: Fault,
  cost: RepairCost,
): Verdict {
  return computeVerdict({
    device,
    fault,
    cost,
    condition: "good",
    wantsDiy: false,
    currentYear: CURRENT_YEAR,
  });
}

export function seoTitle(device: Device, fault: Fault): string {
  return `${device.name} ${faultNoun(fault)} — repair or replace? (${CURRENT_YEAR} cost comparison)`;
}

export function seoDescription(
  device: Device,
  fault: Fault,
  cost: RepairCost,
): string {
  return `${device.name} ${faultNoun(fault)}: independent repair runs ${usdRange(
    cost.independentUSD,
  )} vs a ~${usd(device.refurbishedPriceUSD)} refurbished replacement. See the full math and a clear verdict on ${SITE_NAME}.`;
}

/** A one-line "for a [device] in good condition, repair usually wins/loses". */
export function miniVerdictSentence(v: Verdict, device: Device): string {
  const outcome =
    v.tone === "repair"
      ? "repairing usually wins"
      : v.tone === "borderline"
        ? "it's genuinely a close call"
        : "replacing usually makes more sense";
  return `For a ${device.name} in good condition, ${outcome} — ${v.reason}`;
}

export function faqItems(
  device: Device,
  fault: Fault,
  cost: RepairCost,
  v: Verdict,
): FaqItem[] {
  const yearsLeft = device.supportEndYear - CURRENT_YEAR;
  return [
    {
      question: `How much does a ${device.name} ${faultNoun(fault)} repair cost?`,
      answer: `Independent shops typically charge ${usdRange(
        cost.independentUSD,
      )}, while an official ${device.brand} repair runs ${usdRange(
        cost.officialUSD,
      )}${cost.diyPartsUSD ? `. DIY parts cost about ${usdRange(cost.diyPartsUSD)}` : ""}. These are ${cost.confidence}-confidence estimates — confirm with a local quote.`,
    },
    {
      question: `Is it worth repairing a ${device.name} with ${faultNounLower(fault)}?`,
      answer: miniVerdictSentence(v, device),
    },
    {
      question: `How long will the ${device.name} get software updates?`,
      answer:
        yearsLeft > 0
          ? `The ${device.name} is expected to receive security updates until around ${device.supportEndYear} — about ${yearsLeft} more year${yearsLeft === 1 ? "" : "s"} from ${CURRENT_YEAR}.`
          : `The ${device.name}'s software support is expected to have ended around ${device.supportEndYear}, which weighs against paying for a repair.`,
    },
  ];
}

/** JSON-LD FAQPage schema object. */
export function faqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
}

/** JSON-LD BreadcrumbList — powers breadcrumb rich results in search. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function faultNoun(fault: Fault): string {
  // Turn a fault label into a compact noun phrase for titles.
  const map: Record<string, string> = {
    screen: "screen repair",
    battery: "battery replacement",
    "charging-port": "charging port repair",
    "back-glass": "back glass repair",
    camera: "camera repair",
    "water-damage": "water damage repair",
    "speaker-mic": "speaker/mic repair",
    keyboard: "keyboard repair",
    hinge: "hinge repair",
    "ssd-storage": "storage/SSD repair",
    "wont-turn-on": "won't-turn-on repair",
  };
  return map[fault.id] ?? `${fault.label} repair`;
}

function faultNounLower(fault: Fault): string {
  const map: Record<string, string> = {
    screen: "a cracked screen",
    battery: "a worn battery",
    "charging-port": "a bad charging port",
    "back-glass": "cracked back glass",
    camera: "a broken camera",
    "water-damage": "water damage",
    "speaker-mic": "a speaker or mic fault",
    keyboard: "a faulty keyboard",
    hinge: "a broken hinge",
    "ssd-storage": "a storage failure",
    "wont-turn-on": "no power",
  };
  return map[fault.id] ?? fault.label.toLowerCase();
}

export { midpoint };
