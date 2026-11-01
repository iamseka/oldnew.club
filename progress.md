# Old New Club -- Progress

> Last updated: 2026-10-29 (Session: Framer -> Cloudflare Pages port)

## Current Status

2026-10-29: Framer cancelled (ends 11/4). Picked a hand-written static site; host went Netlify -> Cloudflare Pages the same day (Netlify free pauses sites after 300 credits/month). Captured the Framer page (screenshots + computed styles at 1440/900/390, viewer settings from the bundle). Built `site/` on branch `cloudflare-migration`: index.html, styles.css (Framer's exact breakpoints and fallback fonts), viewer.js (plain-JS port, same fixes), self-hosted OFL fonts, GLBs. Text layout matches Framer within 1px at all three widths, page heights identical. `scripts/check-viewers.py`: 12/12 pass locally (3 cold desktop runs 4/4, phone scroll + teardown, fail -> tap to retry), and 6 FAIL with models removed (proves the check works). 2026-10-31: Cloudflare zone, nameservers and Email Routing done and verified. Next: Pages project, preview check, cutover Sun 11/2. Plan: ~/.claude/plans/my-framer-subscription-is-snazzy-willow.md

2026-10-13: Fixed jackets failing on first visit. Root cause: three.js add-ons loaded in parallel with three.min.js and crashed when they arrived first (cold cache), plus an error-retry loop (~3,500 rebuilds in 30s). Fix lives in `GLB Model Viewer`; pasted into Framer and published 2026-10-13; live check passed (3 cold-cache runs: 4/4 jackets, 0 console errors, WASM Draco). Verified in a local harness that forces the race (old: 0/8 render, 5,174 errors; new: 8/8, 0 errors).

Framer site is live and functional. GLB model files restored and optimized (63 MB down to 2.9 MB). Updated Framer code component with Draco decoder support. Tech stack decisions still pending for static site migration.

## 2026-10-31 -- Cloudflare zone live, Email Routing on

**Branch / repo state:** `cloudflare-migration` (main untouched)

### Accomplished
- Seka moved oldnew.club to Cloudflare DNS and switched nameservers at Namecheap; verified kaiser/raphaela at the registry.
- Stray 162.255.119.127 apex record removed; the 1-in-3 HTTPS timeout on the bare domain is gone.
- Email Routing activated: MX route1-3, SPF and DKIM verified via dig; inquire@ rule -> Seka's Gmail (destination fixed after inquire@ was first added as its own destination).
- Site still served by Framer (www 200, apex 308 -> www).

### Decisions Made
None this session (executed the 2026-10-29 plan).

### Next Steps
- (blocking, before Sun 11/2) Create the Pages project: Connect to Git iamseka/oldnew.club, production branch main, framework None, no build, output `site`.
- Run `python3 -I scripts/check-viewers.py <preview-url>` + render-vs-reference on the branch preview; Seka signs off.
- Sun 11/2 cutover: merge to main, add www + apex custom domains, root -> www 301 Redirect Rule, verify.
- After 11/4: delete root GLBs + root `GLB Model Viewer` (ask Seka).

### Open Questions
- None new. Test email to inquire@ reported done by Seka; not independently confirmed from here.

### Blockers
None.

### Pointers for Next Session
- MEMORY.md, progress.md, docs/plans/2026-10-29-my-framer-subscription-is-snazzy-willow.md, scripts/check-viewers.py

## 2026-10-29 -- Framer port built, host moved to Cloudflare Pages

**Branch / repo state:** `cloudflare-migration` (not merged; main untouched so Framer keeps loading root GLBs)

### Accomplished
- Captured the Framer site: screenshots + computed styles at 1440/900/390, per-jacket viewer settings, icons, favicons, OG image (docs/references/framer-capture/).
- Built site/: index.html, styles.css, viewer.js (plain-JS port of GLB Model Viewer), 39 self-hosted OFL font subsets, GLB copies, _headers, robots, sitemap.
- Text layout within 1px of Framer at all 3 widths; page heights identical.
- Added scripts/check-viewers.py (12/12 pass locally; 6 FAIL with models removed) and scripts/fetch-fonts.py.

### Decisions Made
- **Decision**: Cloudflare Pages, not Netlify. **Why**: Netlify free pauses the site after 300 credits/month (~3,500-4,000 visits).
- **Decision**: Nameservers + inquire@ move to Cloudflare (Email Routing -> Seka's Gmail, no catch-all). **Why**: bare domain needs the zone on Cloudflare; Namecheap forwarding dies off Namecheap DNS.
- **Decision**: 1:1 port, no generator. **Why**: one page, one-week deadline.

### Next Steps
- (blocking, by Fri 10/31) Seka adds oldnew.club to Cloudflare, prunes records, switches nameservers at Namecheap, enables Email Routing, test mail.
- Create Pages project from repo (output `site`, no build), run check-viewers.py on the preview, Seka signs off.
- Sun 11/2 cutover: merge, attach domains, root -> www redirect rule.

### Open Questions
- Club glyph renders in Arial (Framer quirk); fix later?
- Keep mailto or add a form later?

### Blockers
- Seka's Cloudflare dashboard + Namecheap nameserver steps.

### Pointers for Next Session
- MEMORY.md (Current State, move order), docs/decisions.md (last 3 entries), docs/plans/2026-10-29-my-framer-subscription-is-snazzy-willow.md

## Scope

### P0 (Critical Path)

- Site renders with home page
- About page
- Collection page (product gallery)
- Inquiry form page
- Products load from content/products/ markdown files
- Static site builds and deploys

### P1 (Important)

- Media pipeline optimizes Scaniverse exports (images) during build
- Brand manifesto page
- Thumbnail generation for product images

### P2 (Nice to Have)

- Video loop support for product showcases
- SEO metadata (Open Graph, structured data)
- Responsive breakpoints matching current Framer site (desktop 1200+, tablet 648-1199, mobile <648)

### P3 (Future)

- Privacy-friendly analytics integration
- Social media embed/link blocks

## Decisions Made

- 2026-03-03: Project scaffolded from blueprint. Four-module structure: site-engine, content-layer, media-pipeline, inquiry-handler. Content-driven architecture with markdown product files.
- 2026-03-18: Prices are real ($150/$250), not inquiry-only. Updated product schema assumption.
- 2026-03-18: Keep 3D model viewing (GLB) on the site. Optimized with Draco compression + WebP textures.
- 2026-03-18: Migration priority: performance now, static site migration next, conversion/SEO later.
- 2026-10-13: GLB viewer loads three.min.js first, then add-ons, via one page-wide promise. Error state no longer auto-retries (tap to retry). Draco decoder switched to WASM. Why: parallel async loads raced and the auto-retry looped.
- 2026-05-21: Adopted in-repo MEMORY.md as the single source of truth for session memory (harness audit Phase 2 propagation). Added rule to CLAUDE.md: NEVER write durable memory to `~/.claude/projects/.../memory/` because it does not sync across devices.

## Open Questions

- Logo club symbol is drawn in Arial (Framer quirk, kept for the 1:1 port); Android without Arial falls back. Fix later?
- Inquiry: keep mailto, or add a form in a later slice?
