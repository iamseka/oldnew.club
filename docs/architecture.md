# Old New Club -- Architecture

> Date: 2026-03-03
> Status: Initial -- from scaffold blueprint

## System Overview

Old New Club is a static marketing website for an upcycled fashion brand. The site follows an inquiry-based sales model -- customers browse the collection and submit inquiries through a form rather than adding items to a cart. There is no user authentication, no payment processing, and no server-side state.

The system is built around a content-driven architecture. Product data lives in the repository as markdown files with YAML frontmatter. A static site generator reads these files at build time and produces the final HTML. This means adding a new product to the collection requires only adding a markdown file and product images -- no code changes.

Media assets originate from Scaniverse, a 3D scanning app that produces high-resolution imagery and .glb model files. A media optimization pipeline runs during the build step to produce web-ready images and thumbnails from these exports.

## Components

### Site Engine

- **Purpose**: Configures and runs the static site generator. Defines page templates, layouts, and routing for home, about, collection, inquiry, and manifesto pages.
- **Inputs**: Content files (from Content Layer), optimized media (from Media Pipeline), site configuration
- **Outputs**: Static HTML/CSS/JS ready for deployment
- **Dependencies**: Static site generator (TBD), styling framework (TBD)

### Content Layer

- **Purpose**: Defines the structure and schema for all site content. Product markdown files, brand copy, and collection metadata live here. This is the primary interface for non-technical content updates.
- **Inputs**: Manually authored markdown/YAML files
- **Outputs**: Structured data consumed by Site Engine at build time
- **Dependencies**: None (pure content, no runtime dependencies)

### Media Pipeline

- **Purpose**: Optimizes Scaniverse exports for web delivery. Produces compressed images, thumbnails, and potentially video loops from raw 3D scan output.
- **Inputs**: Raw Scaniverse exports (images, video, .glb files)
- **Outputs**: Optimized images, thumbnails, video loops (web-ready formats)
- **Dependencies**: Image processing tools (TBD -- likely sharp, ffmpeg, or similar)

### Inquiry Handler

- **Purpose**: Receives customer inquiries submitted through the site form. Routes notifications to Seka. No data is stored beyond what the form service retains.
- **Inputs**: Form submissions from site visitors (name, email, message, product reference)
- **Outputs**: Email notification to inquire@oldnew.club
- **Dependencies**: Form handling service (TBD -- Formspree, Netlify Forms, or serverless function)

## Data Flow

```
content/products/*.md  -->  Site Engine (build)  -->  Static HTML
                                  ^
                                  |
Media Pipeline (build)  -->  Optimized assets

Site Form  -->  Inquiry Handler  -->  Email notification
```

## Tech Stack

- **Static site generator**: TBD (options: Astro, 11ty, Hugo)
- **Styling**: TBD (Tailwind CSS likely)
- **Hosting**: TBD (options: Vercel, Netlify, Cloudflare Pages)
- **Form handling**: TBD (options: Formspree, Netlify Forms, serverless function)
- **Image optimization**: TBD (likely sharp or similar, integrated into build)
- **Fonts**: UnifrakturCook (Old English logo), Rock 3D (logo "N"), EB Garamond (body), Inter Display
- **Brand color**: #c20e0e (red)

## External Dependencies

- **Scaniverse** (iOS app): Source of product media. Not a runtime dependency. Exports are committed to the repo or processed locally before build.
- **Form service** (TBD): Handles inquiry submissions. If unavailable, the inquiry form degrades -- users could fall back to the mailto:inquire@oldnew.club link.
- **DNS**: oldnew.club domain (already registered). Needs to be pointed at hosting provider.
- **Existing .glb assets**: Four 3D model files from the current Framer site (nine-faces, onward-upward, plaits-please, sun-ghost). May be reused or replaced with 2D imagery.

## Migration Context

This project replaces a Framer-hosted single-page site. The Framer-generated code is not portable. Key elements to carry over:

- Brand identity: colors, typography, tone
- Product imagery and 3D model assets (.glb files)
- Responsive breakpoints: desktop 1200+, tablet 648-1199, mobile <648
- Inquiry flow (currently mailto, upgrading to form-based)
