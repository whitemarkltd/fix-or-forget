# Fix or Ditch

A free, static web tool that answers one question: **is my broken phone or
laptop worth repairing, or should I replace it?**

Users pick their device, its condition, and the fault. The tool returns a clear
verdict — REPAIR / BORDERLINE / REPLACE — with the full math visible: repair cost
(official vs. independent), refurbished replacement price, trade-in value of the
broken device, and remaining software-support lifespan. Revenue comes from
affiliate links on both outcomes.

Built with **Next.js (App Router, static generation) + Tailwind CSS + TypeScript**.
No database — [`/data`](./data) *is* the CMS.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — everything works with blanks
npm run dev                  # http://localhost:3000
npm test                     # run the verdict-engine unit tests
npm run build                # static production build
```

Node 18+ recommended.

---

## Project structure

```
data/                    The hand-maintained content (the CMS)
  devices.json           Device catalogue (prices, support window, trade-in)
  faults.json            Fault catalogue (labels, DIY skill, SEO templates)
  repairCosts.json       Per-device×fault repair ranges + categoryDefaults
  types.ts               TypeScript types for all of the above
  index.ts               Typed access + lookup helpers
lib/
  verdict.ts             The pure verdict engine (fully unit-tested)
  verdict.test.ts        Unit tests for the 6 rules + generic fallback
  resolveVerdict.ts      Turns wizard state -> computed verdict
  wizardState.ts         Encode/decode wizard state to shareable URL params
  affiliates.ts          Env-driven affiliate link builders
  seo.ts                 SEO title/description/FAQ/JSON-LD assembly
  format.ts, site.ts     Money formatting + site constants
app/
  page.tsx               Landing page
  check/                 The wizard + verdict result page
  repair/[deviceId]/[faultId]/   ~96 programmatic SEO pages
  device/[deviceId]/     Device hub pages
  about, how-it-works, affiliate-disclosure, privacy
  api/feedback/route.ts  Feedback webhook forwarder (serverless)
  sitemap.ts, robots.ts  SEO plumbing
components/               Presentational + interactive UI
```

---

## Editing the data (for non-developers)

**All prices live in [`/data`](./data). You never need to touch component code.**
Every file is plain JSON. After editing, run `npm run build` (or just push — Vercel
rebuilds automatically) and the whole site updates.

### Update a price (under 5 minutes)

1. Open [`data/repairCosts.json`](./data/repairCosts.json).
2. Find the block with the `deviceId` and `faultId` you want.
3. Edit the numbers. **Always use a `[low, high]` range, never a single price.**
   ```jsonc
   {
     "deviceId": "iphone-13",
     "faultId": "battery",
     "officialUSD": [89, 99],      // manufacturer out-of-warranty
     "independentUSD": [45, 75],   // typical third-party shop
     "diyPartsUSD": [30, 50],      // parts only, or null
     "confidence": "high"          // "high" | "medium" | "low"
   }
   ```
4. Bump `"confidence"` to `"medium"` or `"high"` once you've verified it against a
   real listing. It shows as a data-quality hint on the page.

Refurbished prices and trade-in values live in
[`data/devices.json`](./data/devices.json) (`refurbishedPriceUSD`,
`tradeInBrokenUSD`). Verify these against live Back Market listings before launch.

> All seed prices ship marked `"confidence": "low"` — they are realistic
> placeholders, not verified numbers.

### Add a new device

1. Add an object to [`data/devices.json`](./data/devices.json) following the shape
   of an existing entry. The `id` is the URL slug (e.g. `iphone-16`).
2. Add one repair-cost row per applicable fault to
   [`data/repairCosts.json`](./data/repairCosts.json) (`rows` array). The applicable
   faults are whichever ones list your device's `category` in
   [`data/faults.json`](./data/faults.json).
3. Run `npm run build`. New SEO pages, the device hub, and sitemap entries generate
   automatically.

There's a seed generator at `scripts/`-style logic you can copy from git history if
you'd rather bulk-generate cost rows, but hand-editing JSON is the intended path.

### Add a new fault

Add an object to [`data/faults.json`](./data/faults.json) (include a `faultClass`
of `screen`/`battery`/`other` and an `seoGuidance` sentence with `{device}`), then
add matching rows to `repairCosts.json` for every device it applies to, plus a
`categoryDefaults` entry for the generic-fallback flow.

---

## Affiliate IDs

All affiliate links are built in [`lib/affiliates.ts`](./lib/affiliates.ts) and read
from environment variables — **no real IDs are hard-coded anywhere.** Set them in
`.env.local` (local) or the Vercel dashboard (production):

| Env var | Purpose |
|---|---|
| `NEXT_PUBLIC_AFFILIATE_BACKMARKET_TAG` | Back Market partner tag (refurbished links) |
| `NEXT_PUBLIC_AFFILIATE_AMAZON_TAG` | Amazon Renewed associates tag |
| `NEXT_PUBLIC_AFFILIATE_IFIXIT_TAG` | iFixit affiliate tag (DIY parts links) |
| `NEXT_PUBLIC_AFFILIATE_TRADEIN_BASE_URL` / `_TAG` | Trade-in / buyback service |
| `NEXT_PUBLIC_REFURB_MARKETPLACE` | `backmarket` (default) or `amazon` |

All affiliate links render with `rel="sponsored nofollow"` and an inline disclosure,
plus a site-wide [`/affiliate-disclosure`](./app/affiliate-disclosure/page.tsx) page.

---

## Analytics & feedback

- **Analytics** (cookieless, no consent banner): set
  `NEXT_PUBLIC_ANALYTICS_SCRIPT_URL` and `NEXT_PUBLIC_ANALYTICS_SITE_ID` to your
  Plausible/Umami values. Blank = disabled.
- **Feedback widget** POSTs to `/api/feedback`, which forwards to whatever webhook
  you set in `FEEDBACK_WEBHOOK_URL` (Formspree, a Google Apps Script, Zapier, etc.).
  No database. Blank = the widget accepts input and no-ops.

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. In Vercel, **New Project → Import** the repo. Framework preset: **Next.js**
   (auto-detected). No build settings changes needed.
3. Add your environment variables (Project → Settings → Environment Variables),
   using [`.env.example`](./.env.example) as the checklist. At minimum set
   `NEXT_PUBLIC_SITE_URL` to your real domain so the sitemap and canonical tags are
   correct.
4. Deploy. The free tier is sufficient — the SEO pages are statically generated and
   the only serverless function is the tiny feedback forwarder.

Verify after deploy: `/sitemap.xml` lists every page, and any
`/repair/<device>/<fault>` page renders with an FAQ block and unique title.

---

## The verdict engine

The decision logic lives entirely in [`lib/verdict.ts`](./lib/verdict.ts) as a pure
function, with the rules documented in
[`/how-it-works`](./app/how-it-works/page.tsx). It's covered by unit tests in
[`lib/verdict.test.ts`](./lib/verdict.test.ts) — run `npm test`. If you change the
math, update the tests.

---

## License / disclaimer

Fix or Ditch is an informational guide, not a repair service. All prices are
estimates; users should confirm with a real quote. Affiliate relationships never
influence a verdict.
