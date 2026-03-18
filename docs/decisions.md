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
