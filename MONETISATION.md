# Monetisation plan — Fix or Forget

## The core thesis

Fix or Forget isn't a content site that happens to have ads — it's a **decision
tool that fires at the exact moment of a purchase decision.** Every verdict ends
with the user about to spend money: buy a refurbished replacement, buy DIY parts,
book a repair, or sell their broken device. That's the highest-intent moment in
the whole repair-vs-replace journey, which makes affiliate placement here worth
far more per visitor than a typical blog.

So the strategy is **affiliate-first, conversion-obsessed, trust-protected** — not
display-ads-and-hope.

## Principle #1 — neutrality is the product, and the asset

The verdict must never bend toward the outcome that pays more. The moment users
suspect the math is rigged to sell them a refurb, the site is worthless. Every
monetisation decision below is filtered through one test: **does it compromise the
verdict's neutrality or the "no tracking, no cookie-banner" promise?** If yes, it's
either rejected or clearly walled off. This isn't idealism — trust is *why* the
pages rank and get shared, which is *what* generates the revenue.

---

## Revenue streams, ranked by fit

### 1. Affiliate commerce — the core (already architected)

The plumbing exists in [`lib/affiliates.ts`](./lib/affiliates.ts), env-driven so
real IDs drop in without code changes. Map of outcome → partner → what to join:

| Verdict | CTA (in the app) | Partner / program | Typical commission* | Status |
|---|---|---|---|---|
| REPLACE | "See refurbished [device]" | **Back Market** Partner (via Partnerize/Impact) | ~% of order or flat bounty | env: `BACKMARKET_TAG` |
| REPLACE | (alt marketplace) | **Amazon Renewed** (Associates) | ~1–4% electronics | env: `AMAZON_TAG` |
| REPLACE | "Trade in your broken one" | **SellCell / Decluttr / Gazelle** buyback | CPA bounty per trade-in | env: `TRADEIN_*` |
| REPAIR | "Find repair parts (DIY)" | **iFixit** affiliate | ~5–10% on parts/kits | env: `IFIXIT_TAG` |
| REPAIR | "What shops charge" | **currently a plain Google link — see leak below** | $0 | non-affiliate |

\* *Illustrative ranges — confirm exact terms when you apply to each program. Don't
quote these to anyone as fact.*

**The two biggest affiliate moves:**

- **REPLACE is double-sided.** A replace verdict should monetise *both* sides of the
  transaction: the user **buys** a refurbished device (Back Market/Amazon) **and
  sells** their broken one (trade-in bounty). Most tools capture one side; capturing
  both roughly doubles revenue per REPLACE verdict. The UI already shows both CTAs —
  make sure both carry live affiliate tags.
- **Plug the "what shops charge" leak.** That CTA currently points at a plain Google
  search ([`shopSearchUrl`](./lib/affiliates.ts)) earning $0. On REPAIR/BORDERLINE
  verdicts, a big slice of users want a shop, not DIY. Route this to a **repair-
  booking affiliate / lead-gen** partner (Asurion/uBreakiFix, Puls, or a local-repair
  lead network) instead. This is the single clearest money-left-on-the-table fix.

### 2. Trade-in / buyback bounties (underrated)

Buyback programs often pay a **fixed CPA** ($5–25) per completed trade-in, which
converts well because the user already has a broken device in hand and the site
just told them it's worth replacing. Applies to REPLACE *and* BORDERLINE verdicts,
and even to some REPAIR users who'll upgrade anyway. Low effort, high intent.

### 3. Repair-booking lead generation

Beyond a simple affiliate link, "book a repair near me" is a genuine **lead-gen
product**: mail-in repair services and national chains pay per booking/lead. This
is the natural evolution of the "what shops charge" CTA and could become its own
revenue line without a local-directory build (which the spec puts out of scope).

### 4. Display advertising — **conditional, with a real tradeoff**

Networks (Raptive ≈100k pageviews/mo, Mediavine ≈50k sessions, Journey/Ezoic
lower) pay a per-thousand-impression RPM. **But** they set third-party cookies,
which breaks the site's "no cookie banner / privacy-friendly" positioning and would
force a consent flow in the EU. Recommendation: **hold off at launch.** Revisit only
once traffic is high, and if so, consider **privacy-friendly / contextual ad
networks** that don't need consent, so the positioning survives. Affiliate EPC on
high-intent pages will almost certainly beat display RPM here anyway.

### 5. Email capture → owned audience

A light, optional "email me this verdict / price-drop alerts for [device]" capture
turns one-time SEO visitors into a re-marketable list: refurb price-drop alerts,
"your device's support window ends next year" nudges — all affiliate-monetisable,
and owned (not rented from Google). Keep it optional to protect the no-friction UX.

### 6. Sponsorships / native placements

Once traffic is real, refurbishers and buyback services will pay for **disclosed**
native placement ("Verified refurbisher" badge, featured partner). Must be clearly
labelled and must **never** alter the verdict — same guardrail as everything else.

### 7. Long-term optionality (low near-term priority)

- **License the verdict engine / data** ([`lib/verdict.ts`](./lib/verdict.ts) + the
  `/data` price table) as an API or white-label widget to carriers, insurers, or
  retailers.
- **Affiliate on adjacent decisions**: device insurance / AppleCare leads, protection
  plans surfaced on REPAIR verdicts ("protect the device you just fixed").

---

## Unit economics — illustrative funnel

Numbers below are **illustrative** to show the levers, not forecasts.

```
1,000 REPLACE-verdict sessions
  × 25% click a "buy refurbished" CTA        =   250 marketplace clicks
  ×  2% purchase on the marketplace          =     5 sales
  × ~$25 avg commission                      =  $125
  + trade-in side: 1,000 × 8% × ~$12 bounty  =  ~$96
  ─────────────────────────────────────────────────
  ≈ $220 per 1,000 replace verdicts  (~$0.22 / session, before repair-side revenue)
```

The three levers, in priority order:
1. **Traffic** — SEO is the engine (299 static pages and growing). More device×fault pages = more high-intent entrances.
2. **Conversion** — verdict clarity + CTA prominence + **verified prices** (trust). This is why the pricing-confidence work matters commercially, not just editorially: accurate prices → users trust the verdict → they click → they buy.
3. **Commission** — negotiate up as volume grows; prefer partners with flat bounties over tiny percentages.

---

## Staged roadmap

**Now (pre-launch)**
- Apply to affiliate programs: Back Market, Amazon Associates, iFixit, a buyback CPA (SellCell/Decluttr), and a repair-booking/lead partner. Approval takes days–weeks — start today.
- Drop the real IDs into env vars (Vercel/Cloudflare). Nothing else in code changes.
- Fix the "what shops charge" leak (route to a paid partner).
- Verify the top-traffic prices (iPhone/Galaxy/Pixel screen & battery) — trust = conversion.

**0–3 months (launch → first revenue)**
- Instrument affiliate click events (the cookieless analytics hook already exists) so you can see EPC per verdict type and per partner.
- A/B the CTA copy and the double-sided REPLACE layout.
- Add the optional email capture.

**3–12 months (scale what converts)**
- Double down on the device pages that earn (more models, more faults).
- Negotiate better commissions with your highest-volume partner.
- Stand up repair-booking lead-gen as its own line.
- Re-evaluate contextual/privacy-friendly display ads *only* if the trust tradeoff nets out positive.

**12 months+ (optionality)**
- Newsletter-driven price-drop/upgrade alerts.
- Explore data/API licensing and insurance/protection affiliate.

---

## Metrics to watch

- **EPC / RPM by verdict type** (REPAIR vs REPLACE vs BORDERLINE) — tells you which outcomes and which pages actually pay.
- **CTA click-through rate** per verdict and per partner.
- **Assisted vs last-click** — trade-in and DIY often assist even when refurb gets the last click.
- **Organic entrances per device×fault page** — where SEO is working.
- **Feedback 👍/👎 rate** (already built) — a proxy for trust, which leads conversion.

## What NOT to do (trust guardrails)

- ❌ Never let commission influence the verdict math or which outcome leads.
- ❌ No interstitials, pop-ups, or auto-redirects to affiliate pages.
- ❌ No hidden affiliate links — keep `rel="sponsored nofollow"` and the visible disclosure ([`/affiliate-disclosure`](./app/affiliate-disclosure/page.tsx)).
- ❌ Don't add cookie-based ad networks without accepting (and disclosing) the loss of the privacy positioning.
- ❌ Don't fabricate "verified" prices to make a CTA look better — inaccurate numbers destroy the trust that drives every dollar here.
