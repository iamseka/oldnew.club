# Content Layer

The Content Layer defines the schema and structure for all site content. Product data, brand copy, and collection metadata are authored as markdown and YAML files in the content/ directory. This module owns the content format -- what fields a product has, how collections are organized, and how content files map to site pages.

## Interfaces

- **Inputs**: Manually authored markdown/YAML files in content/products/
- **Outputs**: Structured content consumed by Site Engine at build time

## Constraints

- Adding a new product must require only a markdown file and images -- no code changes
- Product files use YAML frontmatter for metadata (name, description, price range, status, images)
- Content format documented in content/products/_schema.md
- No CMS. No database. All content version-controlled in the repo.

## Data

Product content lives in content/products/ at the project root, not in this module directory. See content/products/_schema.md for the expected file format.
