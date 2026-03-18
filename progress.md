# Old New Club -- Progress

> Last updated: 2026-03-18 (Session: Site review and GLB optimization)

## Current Status

Framer site is live and functional. GLB model files restored and optimized (63 MB down to 2.9 MB). Updated Framer code component with Draco decoder support. Tech stack decisions still pending for static site migration.

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

## Open Questions

- Static site generator: Astro, 11ty, or Hugo?
- Styling: Tailwind CSS or something else?
- Hosting: Vercel, Netlify, or Cloudflare Pages?
- Form handling: Formspree, Netlify Forms, or serverless function?
