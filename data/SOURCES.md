# Pricing sources & confidence log

This file tracks where the numbers in `repairCosts.json` and `devices.json` come
from, so every figure is traceable and the site owner knows exactly what still
needs verifying before launch.

## Confidence levels — what they mean here

| Level | Meaning |
|---|---|
| `high` | Verified against a **live primary source** (manufacturer price page, live marketplace listing) at the date noted below. |
| `medium` | **Researched and cross-checked** against multiple secondary sources and consistent with the manufacturer's known pricing tiers, but **not** confirmed against the live primary page. |
| `low` | Realistic **placeholder** — a plausible estimate, not researched. Do not present as fact. |

> Most rows are still `low`. They are seed placeholders. Verify and promote them
> over time using the workflow below.

## What has been researched (last updated 2026-07-12)

### Apple iPhone — screen & battery (`medium`)
Applies to `iphone-12`, `iphone-13`, `iphone-14`, `iphone-15` (standard, non-Pro).

- **Official battery (out-of-warranty):** iPhone 12 $99 · 13 $109 · 14 $119 · 15 $119.
- **Official screen (out-of-warranty):** ~$279 (standard models; Pro/Plus/Pro Max are higher — add those models separately if listed).
- **DIY parts (iFixit):** screen fix kit ~$65 (aftermarket LCD) to ~$190 (genuine OLED); battery fix kit ~$35–50.
- **Independent shop:** battery ~$40–75; screen ~$100–170 (aftermarket OLED).

Sources:
- Apple Support — iPhone battery service: https://support.apple.com/iphone/repair/battery-replacement
- Apple Support — iPhone screen service: https://support.apple.com/iphone/repair/screen-replacement
- iFixit iPhone 13 screen & battery parts: https://www.ifixit.com/products/iphone-13-screen · https://www.ifixit.com/products/iphone-13-battery
- 9to5Mac / AppleInsider battery-price reporting (corroboration).

> ⚠️ Apple's price pages are JavaScript-rendered, so these were corroborated from
> secondary sources rather than read off the live page. To promote to `high`,
> open each Apple page above, confirm the exact current figure per model, and
> bump `confidence`.

### Apple iPhone — back glass, & MacBook Air battery (`medium`, 2026-07-12)

- **iPhone back glass** (12/13/14/15): Apple offers back-glass-only repair for iPhone 12+, base models ~$169 (up to ~$259 larger); third-party ~$110–200.
- **MacBook Air M1 battery:** Apple out-of-warranty $159–199 (Air sits at the low end of Apple's $159–249 Mac battery range).

Sources: Apple Mac repair (https://support.apple.com/mac/repair); iPhone back-glass repair reporting (cellularport, ecoatm, 2026 guides); corroborated across multiple shops.

### ⚠️ Known correction NOT yet applied — Apple "other damage" fee

Apple does **not** do cheap component-level repairs. Anything that isn't screen /
battery / back-glass (charging port, camera, water damage, speaker/mic, won't
turn on) is billed as a flat **"other damage"** service fee — roughly **$449–599**
for these iPhone models — because Apple swaps the whole unit. The current
`officialUSD` placeholders for those faults (e.g. ~$115 for a charging port) are
therefore **materially understated**. Left unchanged pending exact per-model
figures, but the site owner should raise these officials. (Independent-shop
numbers for these faults are realistic — third parties do fix them cheaply.)

### Came back too noisy to promote (still `low`)

Web search could not pin these down reliably enough to publish; they need a live-page glance:
- **Refurbished prices:** search returns "from $X" *floor* prices (e.g. Galaxy S21 from $139, Pixel 8 from $195) that understate typical "Very Good" pricing and vary by variant/config. Left as-is.
- **Samsung / Pixel / laptop official screen prices:** inconsistent across sources (parts-only vs full service vs Asurion markup). Left as-is.

### 20-device expansion batch (`medium`, 2026-07-12)

Added 20 popular devices (iPhone 11/15 Pro/16/16 Pro/SE 2022, Galaxy S22/S24/A54/Z Flip 5,
Pixel 6a/9, OnePlus 12, Nothing Phone 2, MacBook Air M2/M3, MacBook Pro 16" 2021,
Dell XPS 15, ThinkPad T14 Gen 3, HP Spectre x360, Framework Laptop 13).

**How each figure was derived — so "medium" is transparent, not overclaimed:**
- **Launch price, release year, support window:** known/verifiable facts (manufacturer update policies).
- **Refurbished price:** anchored to Back Market July-2026 floor prices where found (e.g. iPhone 16 from $440, 15 Pro from $581, SE 2022 from $115, MacBook Air M2 from ~$500), set to a realistic "Very Good" typical above the floor; otherwise via the site's own depreciation model.
- **Apple official screen/battery:** real out-of-warranty tiers — battery $69 (SE) / $89 (iPhone 11) / $99 (15 Pro, 16) / $119 (16 Pro); screen $129 (SE) / $199 (11) / $279 (16) / $329 (Pro). MacBook Air battery $159–199.
- **Foldable (Z Flip 5) inner screen:** treated as the expensive specialist repair (~$449–549).
- **All other repair costs:** **modeled** by scaling the category-average patterns (`categoryDefaults`) by each device's price tier. These are researched-market-informed estimates, **not** per-number live-verified — that's what `medium` means here.

Sources: Back Market price guides & listing floors (July 2026); Apple repair tiers (support.apple.com, corroborated via ecoatm/Talo/9to5Mac); iFixit part pricing.

> ⚠️ Non-Apple **official** repair prices in this batch are modeled, not published
> figures (makers like Samsung/Google/Dell don't post flat per-fault prices).
> Verify before promoting any to `high`.

## Still to verify (all currently `low` placeholders)

- iPhone: charging-port, back-glass, camera, water-damage, speaker-mic, wont-turn-on.
  (Note: Apple bills most non-screen/battery damage under a flat **"other damage"**
  fee — typically far higher than the current placeholders — so these officials are
  likely understated. Confirm on Apple's page before promoting.)
- Samsung Galaxy S21 / S23 — all faults.
- Google Pixel 7 / 8 — all faults.
- Laptops (MacBook Air M1, MacBook Pro 14", ThinkPad X1 Carbon Gen 9, Dell XPS 13) — all faults.
- `devices.json`: `refurbishedPriceUSD` (verify on Back Market) and `tradeInBrokenUSD`
  (verify on a buyback service such as SellCell).

## How to verify a price (the intended workflow)

1. Open the manufacturer's repair page (official) or a live marketplace listing (refurb/trade-in/DIY).
2. Update the `[low, high]` range in the JSON to match what you see.
3. Bump `confidence` to `high` and add/adjust the source line above with the date.
