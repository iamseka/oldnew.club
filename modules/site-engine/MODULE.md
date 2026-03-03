# Site Engine

The Site Engine is the static site generator configuration and template layer that produces the public Old New Club website. It defines page layouts, component templates, routing, and the build process that transforms content and media into deployable static HTML.

## Interfaces

- **Inputs**: Product markdown files from content/products/, optimized media from Media Pipeline, site configuration
- **Outputs**: Static HTML/CSS/JS site ready for deployment to hosting provider

## Constraints

- Static site generator: TBD (Astro, 11ty, or Hugo -- decide and log in docs/decisions.md)
- Must support markdown content with YAML frontmatter as a data source
- Must produce static output (no server-side rendering at runtime)
- Pages: home, about, collection (gallery), inquiry form, brand manifesto
- Responsive: desktop (1200+), tablet (648-1199), mobile (<648)
- Typography: UnifrakturCook, Rock 3D, EB Garamond, Inter Display
- Brand color: #c20e0e (red background), off-black text

## Data

No module-specific data. Build output goes to the standard output directory defined by the chosen SSG.
