# MEMORY.md -- Persistent Memory Across Sessions

> Claude reads this at session start. Durable context only; session detail goes in progress.md.
> Chronological detail lives in progress.md; durable architecture, state,
> and decisions live here.

## Current State (as of 2026-11-01)

- **2026-11-01:** Pages project `oldnew-club` live, `site/` merged to main,
  production at oldnew-club.pages.dev passes check-viewers. Remaining:
  custom domains + root->www redirect rule (Seka), then verify.

- **Deadline:** Framer is cancelled; paid period ends **2026-11-04**. Cutover
  target **Sun 2026-11-02**.
- **Host:** Cloudflare Pages (switched from Netlify the same day: Netlify's
  free plan pauses the site after 300 credits/month). See docs/decisions.md.
- **Built (branch `cloudflare-migration`, not merged):** `site/` is a 1:1 port
  of the Framer page. Matches Framer at 1440/900/390 (same page heights, all
  text within 1px). `scripts/check-viewers.py` passes 12/12 locally and was
  shown to fail with the models removed.
- **DNS today (Cloudflare, verified 2026-10-31):** nameservers
  kaiser/raphaela.ns.cloudflare.com. Apex A = 31.43.160.6 + 31.43.161.6
  (Framer, DNS only); www CNAME sites.framer.app. The stray Namecheap
  redirect (162.255.119.127) is deleted. Email Routing active: MX
  route1-3.mx.cloudflare.net, SPF + DKIM (cf2024-1) live; inquire@ ->
  Seka's Gmail. Gotcha: the destination address is the Gmail, never
  inquire@ itself (that can never verify).
- **Move order (keeps the site up the whole way; steps 1-3 DONE 2026-10-31):** 1) add zone to
  Cloudflare, keep Framer records DNS-only (grey cloud), drop the
  162.255.119.127 record; 2) Seka switches nameservers at Namecheap;
  3) once active, turn on Email Routing (inquire@ -> Seka's Gmail; no catch-all) and test;
  4) on cutover day attach www + apex to the Pages project and add the
  apex -> www redirect rule. Rollback before 11/4 = point records back at
  Framer inside Cloudflare.
- **Root-level GLBs stay until Framer lapses**: the live Framer viewer loads
  them from raw.githubusercontent.com/.../main/. Delete after 11/4, along with
  the root `GLB Model Viewer` (ask Seka first).

## Architecture State

- Four-module structure scaffolded from blueprint (2026-03-03):
  `site-engine/`, `content-layer/`, `media-pipeline/`, `inquiry-handler/`.
- Content-driven: each product is a markdown file with frontmatter in
  `content/products/`. Adding a product should require nothing more
  than a new markdown file + images.
- 3D viewer kept on the site (`onward-upward.glb`, `nine-faces.glb`,
  `plaits-please.glb`, `sun-ghost.glb`).

## Key Decisions

- **Project scaffold (2026-03-03):** four-module structure, content-driven
  architecture with markdown product files.
- **Pricing (2026-03-18):** real prices ($150 / $250), not inquiry-only.
- **3D models on site (2026-03-18):** keep GLB viewer. Optimized with
  Draco + WebP textures.
- **Migration priority (2026-03-18):** performance now, static-site
  migration next, conversion + SEO later.
- **Host + stack (2026-10-29):** Cloudflare Pages free, hand-written static
  `site/`, no generator. Why: no bandwidth cap that can pause the site
  (Netlify free does), one page, one-week deadline.
- **DNS + email to Cloudflare (2026-10-29):** the bare domain needs the zone
  on Cloudflare, and Namecheap forwarding dies off Namecheap DNS, so
  inquire@ moves to Cloudflare Email Routing.
- **1:1 port first (2026-10-29):** match Framer exactly; content-driven
  collection is a later slice.

## Brand Identity (carryover from Framer)

- Primary red: `#c20e0e`
- Display fonts: Old English + Rock 3D
- Body: EB Garamond
- No user data stored. No accounts. No payment processing. Inquiry-based
  sales only.

## Open Questions

- Logo club symbol is drawn in Arial (Framer quirk, kept for 1:1). Devices
  without Arial (most Android) fall back to another font. Fix later?
- Inquiry: keep mailto, or add a form (e.g. Formspree or a Pages Function) in a later slice?
- three.js still loads from unpkg; self-host it in a later slice?

## Instructions for Claude

1. Read CLAUDE.md + this MEMORY.md + progress.md at session start.
2. Tech stack picks must land in `docs/decisions.md` before
   implementation begins.
3. Update this MEMORY.md when architecture decisions land or status
   changes. Per-session detail goes in progress.md.
4. NEVER write durable memory to `~/.claude/projects/.../memory/`.
