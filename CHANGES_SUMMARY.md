# Martina Murphy — URL Restructure & Metadata Fix: Summary

## What changed

**SEO metadata (the core "metadata" ask).** Every page on the site previously
rendered `<title>Website</title>` with no `<meta name="description">` at all
— including pages that already had `meta_title`/`meta_description` written in
their content front matter but never wired up. Fixed in two places:
- `src/layouts/MainLayout.astro` (Astro side) now accepts `title`/`description`
  props and renders title, description, canonical URL, and basic Open Graph tags.
- `hugo-blog/layouts/_default/baseof.html` (Hugo side) now reads
  `meta_title`/`meta_description` from each post's front matter and renders
  the same set of tags.

**URL restructure (the "blog section" ask).** The 38 practice-area pages
(Wills & Probate, Power of Attorney, Family Law, etc.) were being rendered at
`/blog/<slug>/`, with a separate stale, pre-built copy also sitting at
`/blog/posts/<slug>/`. Per your metadata sheet, `/blog/` should be reserved for
the genuine news/insights feed only. Each practice page now has its own `url:`
front-matter field matching the sheet's "Recommended URL Structure" column
(lowercased; `/elder-law/` used per your last answer), and Hugo is now the
actual build pipeline generating them at those URLs (previously its
`publishDir` pointed at an unused folder and never ran in production).

**Two pages got special handling.** `dispute-2` and `redundancy-2` weren't
generic drafts — they're the actual Figma-built pages for Dispute Resolution
and Redundancies (custom hero art, final copy), much more developed than the
plain Hugo template. I moved them to their real URLs
(`/employment-law/employers/dispute-resolution/` and
`/employment-law/employees/redundancies/`) and marked the corresponding
markdown files as `draft: true` so Hugo doesn't build a competing duplicate
at the same path.

**Redirects.** Added `public/_redirects` with 301s from every old URL pattern
(`/blog/<slug>/`, `/blog/posts/<slug>/`, `/dispute-2`, `/redundancy-2`) to the
new locations, so nothing that may already be indexed or bookmarked just 404s.

**Nav/footer links** (`Navbar.astro`, `Footer.astro`, `Topbar.astro`, and the
internal `/dashboard` QA page) updated to point at the new URLs instead of the
old `/blog/...` paths and a couple of dead placeholder links
(`/employment-law-employees`, `/workplace-rights`, etc.).

## Build pipeline

Hugo wasn't actually wired into the deploy — its `publishDir` pointed at a
folder nothing reads from. New flow (`npm run build`):
1. `build:hugo` — installs Hugo's CSS deps, rebuilds Tailwind, runs
   `npx hugo-extended --minify` (downloads a portable Hugo binary at build
   time — no system install needed).
2. `build:astro` — normal `astro build`.
3. `scripts/merge-hugo-output.mjs` — copies Hugo's output into `dist/`,
   skipping Hugo's own root `index.html`/`sitemap.xml` so it doesn't clobber
   Astro's homepage.

**I could not test the Hugo build itself in my sandbox** — the environment's
network allowlist blocks the binary download `hugo-extended` needs, so
`npx hugo-extended` silently failed here. The Astro half builds and renders
correctly (verified — see below). Before merging, please do a Cloudflare
Pages preview build (or run `npm run build` locally with normal internet
access) to confirm the Hugo step actually runs.

**Cloudflare Pages settings to check:** build command `npm run build`,
output directory `dist`, and Node version ≥22.12 (set `NODE_VERSION=22` as an
environment variable if it's not already).

## Full URL mapping

| Content file | New URL |
|---|---|
| accidents-at-work-solicitors.md | /personal-injury/accidents-at-work/ |
| buying-a-property.md | /conveyancing/buying-a-house/ |
| car-injury-solicitors.md | /personal-injury/car-injury/ |
| charities-educational-law.md | /charity-education-law/ |
| child-custody-solicitors.md | /family-law/child-custody/ |
| commercial-property-solicitors.md | /conveyancing/commercial-property/ |
| commissioner-for-oaths.md | /commissioner-for-oaths/ |
| conveyancing.md | /conveyancing/ |
| corporate-governance-compliance-solicitors-limerick.md | /charity-education-law/governance-compliance/ |
| dispute-resolution-solicitors.md | /employment-law/employers/dispute-resolution/ (now the Astro page) |
| divorce-and-assets.md | /divorce-and-assets/ |
| drafting-wills.md | /drafting-wills/ |
| elder-law-solicitors.md | /elder-law/ |
| enduring-power-of-attorney.md | /power-of-attorney/enduring/ |
| estate-planning.md | /estate-planning/ |
| expert-divorce-solicitors.md | /divorce-and-assets/solicitors/ |
| fair-deal-scheme-solicitors.md | /elder-law/fair-deal-scheme/ |
| family-home-property-divorce.md | /divorce-and-assets/family-home-property/ |
| family-law-solicitors.md | /family-law/ |
| financial-power-of-attorney.md | /power-of-attorney/financial/ |
| financial-settlements-pension-division-limerick.md | /divorce-and-assets/financial-settlements/ |
| general-power-of-attorney-solicitors.md | /power-of-attorney/general/ |
| house-purchase-solicitor-fees.md | /conveyancing/fees/ |
| inheritance-and-succession-solicitors.md | /inheritance-solicitors/ |
| judicial-separation-solicitors.md | /divorce-and-assets/judicial-separation/ |
| lasting-power-of-attorney.md | /power-of-attorney/lasting/ ⚠ see below |
| legal-guardianship.md | /family-law/guardianship/ |
| maintenance-child-support.md | /family-law/maintenance/ |
| medical-power-of-attorney-solicitors.md | /power-of-attorney/medical-healthcare/ |
| personal-injury-at-work-solicitors.md | /employment-law/employees/injury-at-work/ |
| personal-injury-solicitors.md | /personal-injury/ |
| power-of-attorney-solicitors.md | /power-of-attorney/ |
| probate-disputes-solicitors.md | /probate-dispute/ |
| redundancy-solicitors-for-employees-limerick.md | /employment-law/employees/redundancies/ (now the Astro page) |
| road-traffic-accidents-solicitors.md | /personal-injury/road-traffic/ |
| selling-a-property-solicitors.md | /conveyancing/selling-a-house/ |
| ward-of-court-solicitors.md | /elder-law/ward-of-court/ |
| wills-and-probate.md | /wills-and-probate/ |

## Things to flag back to the client / follow up on

- **`lasting-power-of-attorney.md` content is wrong.** Its body text and even
  its own `title` field are about Enduring POA, not Lasting POA — looks like
  a copy-paste/content mix-up. It's routed to the correct URL
  (`/power-of-attorney/lasting/`) but needs real LPA copy from the client.
- **Sheet rows with no content yet:** About Us / Meet the Team / LQ Standard,
  Equality, Discrimination, Bullying & Harassment, Drafting Contracts,
  Terms & Conditions, Third Party Contracts, Debt Collection, Boards of
  Management, Contact Us. These URLs are referenced in nav/footer but have no
  page built yet.
- **`/employment-law/employees/` and `/employment-law/employers/` hub
  overview pages don't exist** — the nav currently links straight to the one
  sub-page that does exist under each (Redundancies / Dispute Resolution).
  Worth building proper hub pages once there's content for the other
  sub-items.
- **Out of today's scope, flagged but not touched:** `about-us-2`,
  `services-2`, and `blog-2` are still at their draft URLs (not `/about-us/`,
  etc., per the sheet). I left these alone since they weren't part of the
  "blog section" ask and I didn't want to move pages that might still be in
  client review — happy to do the same treatment on these if you confirm
  they're approved.
- **`astro.config.mjs` has no `site` set** — I defaulted canonical URLs to
  `https://martinamurphy.ie` (inferred from the footer email/social handles).
  Set the real production domain in `astro.config.mjs` (`site: "..."`) once
  confirmed.

## Files in this delivery

- `murphy-url-metadata-changes.zip` — the full repo with changes applied and
  committed locally (one commit on top of your existing history), minus
  `node_modules`/`dist`. Extract and `git push` from your own machine.
- `murphy_url_metadata_changes.patch` — the same change as a plain-text patch,
  if you'd rather review/apply it directly (`git am < murphy_url_metadata_changes.patch`).
