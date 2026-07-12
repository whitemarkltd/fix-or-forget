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
