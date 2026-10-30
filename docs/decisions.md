# Old New Club -- Decision Log

Append-only. Never edit or remove entries. Each decision gets a date, context, decision, and rationale.

---

## 2026-03-03: Project structure

**Context**: Scaffolded from blueprint produced in Claude.ai Chat. Migrating Old New Club website from Framer to a self-hosted static site with an inquiry-based sales model.

**Decision**: Four-module structure mapping to the four core components: site-engine, content-layer, media-pipeline, inquiry-handler. Product content lives in content/products/ as markdown files with YAML frontmatter. Tech stack left as TBD pending separate decisions for SSG, styling, hosting, and form handling.

**Rationale**: Each component has a distinct responsibility and different change frequency. Content Layer changes most often (new products), Site Engine changes during design work, Media Pipeline changes when optimization needs evolve, Inquiry Handler is set-and-forget. Separating them keeps MODULE.md files focused and lets Claude load only relevant context per task. Content at root level (not nested in modules/) because it's the primary interface for adding products.

---

## 2026-03-18: Keep 3D model viewers with optimized assets

**Context**: Site review revealed the GLB model files were deleted during the scaffold commit, breaking all product viewers on the live Framer site. Needed to decide whether to restore 3D viewers or replace with 2D imagery.

**Decision**: Restore and keep 3D model viewing. Optimize GLB files using Draco mesh compression and WebP texture compression (8192x8192 textures resized to 2048x2048). Update Framer code component to include DRACOLoader for decoding compressed meshes.

**Rationale**: The 3D viewers are a distinctive part of the brand experience. Optimization reduced total payload from 63 MB to 2.9 MB (95% reduction), making the performance argument against 3D moot. 2048x2048 textures are more than sufficient for the display size on the site.

---

## 2026-03-18: Products have real prices

**Context**: The scaffold assumed an inquiry-only model with no prices displayed. Review of the live site showed products have real prices ($150-$250).

**Decision**: The product content schema should include a numeric price field, not just "Inquire" text. The site uses a hybrid model -- prices are displayed but purchases go through inquiry.

**Rationale**: Matches the live site behavior. Customers need to see prices before deciding to inquire.

---

## 2026-10-29: Host on Netlify, hand-written static site, no generator

**Context**: Framer was cancelled; the paid period ends 2026-11-04, after which the domain stops serving. The live site turned out to be one page (4 jackets, mailto inquiry), much smaller than the March scaffold assumed.

**Decision**: Netlify free plan. The site is plain hand-written files in `site/` (index.html, styles.css, viewer.js, self-hosted fonts, GLBs), served as-is with no build step or generator. First slice is a 1:1 port of the Framer page; the markdown-driven collection is a later slice. DNS stays at Namecheap.

**Rationale**: Netlify's free plan allows commercial use (Vercel Hobby does not, and Old New Club sells jackets). Keeping DNS at Namecheap leaves the inquire@ email-forwarding records untouched. A generator (Astro/11ty/Hugo) buys nothing for one page and adds risk against a one-week deadline.

---

## 2026-10-29: GLBs served from the site, viewer ported to plain JS

**Context**: Framer loaded the jacket models from raw.githubusercontent.com and ran a pasted copy of the React viewer.

**Decision**: Models live in `site/glb/` and load from the same site. `site/viewer.js` is a plain-JS port of `GLB Model Viewer` with the 2026-10-13 fixes unchanged (sequential three.js load, WASM Draco, tap-to-retry, no auto-retry, teardown off screen). Per-jacket settings are data- attributes in index.html. The root-level GLBs stay until Framer lapses, because the live Framer site still loads them from `main`.

**Rationale**: One source of truth, no paste-into-Framer step, and no dependency on GitHub's raw file CDN (5-minute cache, not meant for production traffic).

---

## 2026-10-29: Cloudflare Pages instead of Netlify (supersedes the Netlify half of the entry above)

**Context**: Netlify's free plan is now credit-based: 300 credits a month, a hard cap, and the site is paused ("Site not available") when they run out. Bandwidth costs 20 credits per GB and each production deploy 15. With 2.9 MB of jacket models per desktop visit, that is roughly 3,500-4,000 visits a month.

**Decision**: Host on Cloudflare Pages (free), deployed from the GitHub repo, publish folder `site/`, no build. Move the domain's nameservers from Namecheap to Cloudflare. Move inquire@ forwarding from Namecheap Email Forwarding to Cloudflare Email Routing. The bare domain redirects to www with a Cloudflare redirect rule.

**Rationale**: Seka does not want a host that can switch the site off. Pages has no bandwidth cap on static files. The bare domain needs the zone on Cloudflare; Namecheap's own redirect (the stray 162.255.119.127 record) only works over HTTP and times out over HTTPS, so it cannot be kept. Namecheap email forwarding only works on Namecheap DNS, so email moves too.
