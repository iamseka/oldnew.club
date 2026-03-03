# Old New Club

Marketing website for Old New Club -- an upcycled fashion brand that hand-paints African tribal masks onto thrifted denim jackets. Inquiry-based sales model, no cart or checkout.

## Quick Context

- **Domain**: Upcycled fashion brand website (migration from Framer to self-hosted static site)
- **Tech stack**: TBD -- see docs/architecture.md for options under consideration
- **Status**: Scaffolded -- not yet implemented

## Project Structure

- `modules/` -- Core components. Each has a MODULE.md with purpose and interfaces
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
- Tech stack choices are TBD -- decide and log in docs/decisions.md before implementing
- Adding a product should only require a new markdown file and images in content/products/
- Brand identity carries over from Framer site: #c20e0e red, Old English + Rock 3D fonts, EB Garamond body text
- No user data stored. No accounts. No payment processing.
