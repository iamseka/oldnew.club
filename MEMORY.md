# MEMORY.md -- Persistent Memory Across Sessions

> Claude reads this at session start. Keep under 100 lines.
> Chronological detail lives in progress.md; durable architecture, state,
> and decisions live here.

## Current State (as of 2026-03-18)

- **Phase:** Scaffolded; tech stack decisions still pending for static
  site migration.
- **Live site:** Framer is currently live and functional.
- **3D assets:** GLB model files optimized 63 MB -> 2.9 MB via Draco
  compression + WebP textures. Framer code component updated with Draco
  decoder support.
- **Next session:** pick a static site generator (Astro / 11ty / Hugo),
  styling system (Tailwind or other), hosting (Vercel / Netlify /
  Cloudflare Pages), and form handler (Formspree / Netlify Forms /
  serverless). Log the picks in `docs/decisions.md`.

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

## Brand Identity (carryover from Framer)

- Primary red: `#c20e0e`
- Display fonts: Old English + Rock 3D
- Body: EB Garamond
- No user data stored. No accounts. No payment processing. Inquiry-based
  sales only.

## Open Questions

- Static site generator: Astro, 11ty, or Hugo?
- Styling: Tailwind CSS or something else?
- Hosting: Vercel, Netlify, or Cloudflare Pages?
- Form handling: Formspree, Netlify Forms, or serverless function?

## Instructions for Claude

1. Read CLAUDE.md + this MEMORY.md + progress.md at session start.
2. Tech stack picks must land in `docs/decisions.md` before
   implementation begins.
3. Update this MEMORY.md when architecture decisions land or status
   changes. Per-session detail goes in progress.md.
4. NEVER write durable memory to `~/.claude/projects/.../memory/`.
