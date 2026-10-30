# Old New Club

Marketing website for Old New Club -- an upcycled fashion brand that hand-paints African tribal masks onto thrifted denim jackets. Inquiry-based sales model, no cart or checkout.

## Quick Context

- **Domain**: Upcycled fashion brand website (migration from Framer to self-hosted static site)
- **Tech stack**: hand-written static site in `site/` (HTML, CSS, plain JS + three.js r0.136 from unpkg), hosted on Cloudflare Pages (free), DNS + email routing on Cloudflare (registrar stays Namecheap). No build step
- **Status**: 1:1 port of the Framer page built on branch `cloudflare-migration`; Cloudflare setup + DNS cutover pending (Framer lapses 2026-11-04)

## IMPORTANT: Memory Storage

MEMORY.md in this repo is the single source of truth for session memory.

NEVER write durable memory to `~/.claude/projects/.../memory/MEMORY.md` --
that path is machine-local and does not sync across MacBook <-> Mac Mini.
All session learnings, decisions, and status updates go in the in-repo
MEMORY.md.

## Project Structure

- `site/` -- The live site, served as-is by Cloudflare Pages (output folder `site`, no build; `site/_headers` sets caching)
  - `viewer.js` -- 3D jacket viewer (plain-JS port of `GLB Model Viewer`)
  - `glb/`, `fonts/`, `images/` -- models, self-hosted OFL fonts, icons + share image
- `scripts/check-viewers.py` -- viewer checks against any URL (run before and after deploys)
- `scripts/fetch-fonts.py` -- re-downloads fonts into `site/fonts/`
- `docs/references/framer-capture/` -- screenshots + measurements of the Framer site (the 1:1 reference)
- `modules/` -- Core components (planning docs from the March scaffold). Each has a MODULE.md with purpose and interfaces
  - `site-engine/` -- Static site generator config and templates
  - `content-layer/` -- Content schema and structure definitions
  - `media-pipeline/` -- Image/video optimization for Scaniverse exports
  - `inquiry-handler/` -- Form submission and notification handling
- `content/` -- Product data and brand copy (markdown/YAML). Add products here
  - `products/` -- One markdown file per product with frontmatter metadata
- `docs/` -- Architecture and decision records
- `progress.md` -- Current scope, status, and next steps
- `scripts/` -- Utility and automation scripts (create when needed)
- `skills/` -- Project-specific Claude Code skills (create when needed)

## Priority System

- **P0**: Critical path. Site renders with core pages. Products load from content files.
- **P1**: Important. Media pipeline, brand manifesto page.
- **P2**: Nice to have. Video loops, SEO metadata.
- **P3**: Future. Analytics, social embeds.

## Working Principles

- Read the relevant MODULE.md before working in any module
- Log architectural decisions in docs/decisions.md (append, never edit)
- Update progress.md after completing any P0 or P1 task
- Ask before introducing new dependencies not listed in architecture.md
- Adding a product should only require a new markdown file and images in content/products/
- Brand identity carries over from Framer site: #c20e0e red, Old English + Rock 3D fonts, EB Garamond body text
- No user data stored. No accounts. No payment processing.
