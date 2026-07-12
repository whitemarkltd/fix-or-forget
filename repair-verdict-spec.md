# Project Spec: "Fix or Ditch" — Repair-vs-Replace Decision Tool

## 1. Product overview

A free web tool that answers one question: **"Is my broken phone or laptop worth repairing, or should I replace it?"**

The user selects their device, its condition/age, and the fault. The tool returns a clear verdict with transparent math: estimated repair cost (official vs. independent shop), the price of an equivalent refurbished replacement, the trade-in value of the broken device, and remaining software-support lifespan. Revenue comes from affiliate links on both outcomes (refurbished marketplaces, DIY parts, trade-in/buyback services).

**Positioning:** a neutral referee. The tool must sometimes recommend replacement and sometimes repair — trust and shareability are the product.

**Target market:** English-speaking / international. Prices in USD for v1 (EUR toggle is a later feature).

**Launch scope:** ~40 devices (phones + laptops), ~8 fault types each.

## 2. Tech stack & constraints

- **Framework:** Next.js (App Router) with static generation. Every SEO page must be statically rendered — this site lives or dies on organic search.
- **Styling:** Tailwind CSS.
- **Data:** a single structured data layer in `/data` as TypeScript/JSON files (no database for v1). All content pages are generated from this data at build time.
- **Hosting target:** Vercel free tier. No server-side runtime dependencies beyond Next.js defaults.
- **No accounts, no login, no cookies requiring a consent banner** (use a privacy-friendly analytics tool like Plausible or Umami, loaded via env-configurable script).
- **Feedback widget** posts to a simple serverless function that appends to a storage target configurable by env var (v1 acceptable: POST to a webhook URL, e.g. a form-capture service). Do not build a database for this.

## 3. Data model

All data lives in `/data`. Keep it human-editable — this table is the core asset and will be maintained by hand.

### 3.1 `devices.json`

```jsonc
{
  "id": "iphone-13",              // slug, used in URLs
  "category": "phone",             // "phone" | "laptop"
  "brand": "Apple",
  "name": "iPhone 13",
  "releaseYear": 2021,
  "launchPriceUSD": 799,
  "refurbishedPriceUSD": 310,      // current typical refurbished market price, hand-maintained
  "tradeInBrokenUSD": {            // typical buyback value WITH the fault class
    "screen": 90, "battery": 140, "other": 60
  },
  "supportEndYear": 2028,          // estimated last year of OS/security updates
  "successorId": "iphone-14",      // nullable; used for "or upgrade to..." suggestion
  "notes": ""                      // free text shown on device page if present
}
```

### 3.2 `faults.json`

```jsonc
{
  "id": "battery",
  "category": ["phone", "laptop"],
  "label": "Battery (drains fast / won't hold charge)",
  "diySkillLevel": "moderate",     // "easy" | "moderate" | "hard" | "not-recommended"
  "urgency": "usable",             // "usable" | "degraded" | "unusable"
  "descriptionShort": "Battery capacity degrades with age; replacement restores full-day use."
}
```

Fault list for v1 — phones: `screen`, `battery`, `charging-port`, `back-glass`, `camera`, `water-damage`, `speaker-mic`, `wont-turn-on`. Laptops: `screen`, `battery`, `keyboard`, `hinge`, `ssd-storage`, `charging-port`, `water-damage`, `wont-turn-on`.

### 3.3 `repairCosts.json`

One row per device × applicable fault:

```jsonc
{
  "deviceId": "iphone-13",
  "faultId": "battery",
  "officialUSD": [89, 99],         // manufacturer out-of-warranty range
  "independentUSD": [45, 75],      // typical third-party shop range
  "diyPartsUSD": [30, 50],         // parts-only cost, nullable if diySkillLevel is "not-recommended"
  "confidence": "high"             // "high" | "medium" | "low" — shown as a data-quality hint
}
```

**Important for the implementing agent:** populate this file with realistic placeholder ranges clearly marked `"confidence": "low"`, and structure the code so the site owner can correct values without touching any component code. Do not invent precise-looking single prices; always use ranges.

### 3.4 `affiliates.ts`

Central config mapping outcome → link builders, all reading from env vars so real affiliate IDs can be added later:

- `refurbishedSearchUrl(device)` → Back Market / Amazon Renewed search URL with affiliate tag
- `diyPartsUrl(device, fault)` → iFixit search URL with affiliate tag
- `tradeInUrl(device)` → buyback service URL with affiliate tag

Render all affiliate links with `rel="sponsored nofollow"` and a small "affiliate link" disclosure near the buttons plus a site-wide disclosure page.

## 4. Verdict engine

Pure function in `/lib/verdict.ts`, fully unit-tested. Inputs: device, fault, device age condition answers. Output: a `Verdict` object.

### 4.1 Inputs collected in the wizard

1. **Category** (phone / laptop)
2. **Brand → Device** (searchable select; "my device isn't listed" → generic fallback flow, see 4.4)
3. **Fault** (list filtered by category)
4. **Otherwise-condition:** "Apart from this fault, the device is…" → `good` | `worn` | `poor`
5. Optional: "Would you attempt a DIY repair?" → yes / no (only shown if the fault has a `diyPartsUSD` value)

### 4.2 Core computation

```
repairCost      = midpoint(independentUSD)          // headline number; official range also shown
replacementCost = refurbishedPriceUSD − tradeInBrokenUSD[faultClass]
                  // net cost of replacing: buy refurbished, sell broken device
conditionFactor = good: 1.0 | worn: 0.85 | poor: 0.65
effectiveValue  = refurbishedPriceUSD × conditionFactor
repairRatio     = repairCost / effectiveValue

yearsLeft       = supportEndYear − currentYear
```

### 4.3 Verdict rules (in order)

1. If `yearsLeft <= 0` → **REPLACE** ("no more security updates").
2. If `repairRatio < 0.30` and `yearsLeft >= 2` → **REPAIR** (strong).
3. If `repairRatio < 0.30` and `yearsLeft == 1` → **REPAIR (leaning)** with a support-window caveat.
4. If `0.30 <= repairRatio <= 0.60` → **BORDERLINE**: show both paths side by side, lead with whichever has lower 2-year cost (`repairCost` vs `replacementCost`), and say why.
5. If `repairRatio > 0.60` → **REPLACE**, unless DIY was selected and `diyPartsUSD` midpoint brings the ratio under 0.30, in which case → **REPAIR (DIY)** with a skill-level warning.
6. `wont-turn-on` and `water-damage` always cap confidence at "diagnosis needed" and add a banner: costs shown are a range pending diagnosis; many shops diagnose free.

### 4.4 Generic fallback (device not listed)

Ask launch price, age in years, and category instead. Estimate `effectiveValue` with a depreciation curve (phones: −35%/yr compounding, floor 10% of launch; laptops: −28%/yr, floor 12%) and use category-level average repair costs (add a `categoryDefaults` block to `repairCosts.json`). Mark the verdict "rough estimate."

### 4.5 Verdict page content (the money page)

In order: (1) big verdict headline + one-sentence reason; (2) the math, fully visible — repair range (official vs independent), refurbished price, trade-in value, net replacement cost; (3) support-lifespan bar ("updates expected until ~2028"); (4) CO₂ note for repair verdicts (use a flat, sourced per-category estimate — phones ~50 kg CO₂e embodied, laptops ~250 kg — with a "rough estimate" footnote); (5) action buttons per verdict — REPAIR: "Find repair parts (DIY)" + "What shops charge"; REPLACE: "See refurbished [device]" + "Trade in your broken one"; BORDERLINE: both sets; (6) feedback widget: "Did this match the quotes you got?" 👍/👎 + optional text; (7) share/copy-link button — verdict URLs must be shareable, i.e. all wizard state encoded in query params.

## 5. Pages & routing

| Route | Purpose |
|---|---|
| `/` | Landing: one-line pitch, wizard entry, trust points, popular devices grid |
| `/check` | The wizard (client component; state in query params) |
| `/check/result?device=…&fault=…&cond=…` | Verdict page (client-computed from static data) |
| `/repair/[deviceId]/[faultId]` | **~300 static SEO pages** (see §6) |
| `/device/[deviceId]` | Device hub: all faults, support window, refurb price |
| `/about`, `/how-it-works`, `/affiliate-disclosure`, `/privacy` | Static pages |

## 6. Programmatic SEO pages

Generated at build time from the data — one per device×fault. Title pattern: **"[Device] [fault] — repair or replace? (2026 cost comparison)"**.

Each page contains: the cost table for that combination, a mini-verdict for a typical case ("for a [device] in good condition, repair usually wins/loses because…"), 2–3 sentences of fault-specific guidance from `faults.json`, an inline CTA into the wizard pre-filled with that device+fault, links to sibling pages (same device other faults; same fault other devices), and FAQ schema (JSON-LD) with 3 questions: "How much does X cost?", "Is it worth it?", "How long will [device] get updates?". Also emit `sitemap.xml` and per-page metadata/OpenGraph. Content must be assembled from data fields plus per-fault template sentences — vary sentence templates by fault so pages aren't near-duplicates.

## 7. Design direction

Clean, calm, trustworthy — think consumer-advice site, not gadget blog. Neutral background, one confident accent color, large readable verdict typography. The math section should look like a receipt: monospaced numbers, clear labels. Mobile-first (most "my phone broke" searches are on phones — often the broken one). Fast: no heavy images, system or single variable font, Lighthouse 95+ on mobile. Verdict states get distinct but non-alarmist colors (repair = green, borderline = amber, replace = blue — not red; replacing isn't a failure).

## 8. Build order

1. Scaffold Next.js + Tailwind; set up `/data` with full schemas and 10 seed devices (below), all faults, and placeholder repair costs marked low-confidence.
2. Implement and unit-test `verdict.ts` (include the six rule cases + generic fallback).
3. Wizard + verdict page with shareable URLs.
4. Static SEO pages + device hubs + sitemap + JSON-LD.
5. Affiliate link config (env-driven), disclosure page, feedback widget (webhook POST), analytics hook.
6. README covering: how to edit the data files, how to add a device, where to insert affiliate IDs, deploy-to-Vercel steps.

## 9. Seed devices (v1 dataset)

Phones: iPhone 12, iPhone 13, iPhone 14, iPhone 15, Samsung Galaxy S21, Galaxy S23, Google Pixel 7, Pixel 8. Laptops: MacBook Air M1 (2020), MacBook Pro 14" (2021), Lenovo ThinkPad X1 Carbon Gen 9, Dell XPS 13 (9310).

Populate every field per §3.1 with realistic estimates; mark `refurbishedPriceUSD` and all repair costs `"confidence": "low"` where not verified. The site owner will verify against Back Market listings and manufacturer price pages before launch.

## 10. Explicitly out of scope for v1

User accounts, EUR/other currencies, price-tracking automation, repair-shop directory/lead-gen, tablets/consoles/appliances, a CMS. The data files ARE the CMS.

## 11. Acceptance checklist

- [ ] Wizard completes in ≤ 5 taps for a listed device; verdict URL is shareable and reproducible
- [ ] Verdict math is visible and matches `verdict.ts` unit tests
- [ ] All ~120 device×fault SEO pages build statically with unique titles/descriptions and FAQ JSON-LD
- [ ] Affiliate links are env-configured, tagged `rel="sponsored nofollow"`, with disclosures present
- [ ] Generic fallback flow works for unlisted devices
- [ ] Lighthouse mobile: Performance ≥ 95, SEO ≥ 95
- [ ] README lets a non-developer update prices in under 5 minutes
