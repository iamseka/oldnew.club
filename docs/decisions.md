# Old New Club -- Decision Log

Append-only. Never edit or remove entries. Each decision gets a date, context, decision, and rationale.

---

## 2026-03-03: Project structure

**Context**: Scaffolded from blueprint produced in Claude.ai Chat. Migrating Old New Club website from Framer to a self-hosted static site with an inquiry-based sales model.

**Decision**: Four-module structure mapping to the four core components: site-engine, content-layer, media-pipeline, inquiry-handler. Product content lives in content/products/ as markdown files with YAML frontmatter. Tech stack left as TBD pending separate decisions for SSG, styling, hosting, and form handling.

**Rationale**: Each component has a distinct responsibility and different change frequency. Content Layer changes most often (new products), Site Engine changes during design work, Media Pipeline changes when optimization needs evolve, Inquiry Handler is set-and-forget. Separating them keeps MODULE.md files focused and lets Claude load only relevant context per task. Content at root level (not nested in modules/) because it's the primary interface for adding products.
