# Old New Club -- Progress

> Last updated: 2026-03-03 (Session: Initial scaffold)

## Current Status

Scaffolded. No implementation yet. Tech stack decisions pending.

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

## Open Questions

- Static site generator: Astro, 11ty, or Hugo?
- Styling: Tailwind CSS or something else?
- Hosting: Vercel, Netlify, or Cloudflare Pages?
- Form handling: Formspree, Netlify Forms, or serverless function?
- How to handle .glb 3D model files from existing repo? (Current Framer site uses GLB Model Viewer)
- Should 3D model viewing carry over, or switch to optimized 2D imagery from Scaniverse?
