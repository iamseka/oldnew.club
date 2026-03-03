# Product Content Schema

Each product in the collection is a markdown file in this directory. The filename becomes the URL slug (e.g., `nine-faces.md` -> `/collection/nine-faces`).

## Frontmatter Format

```yaml
---
name: "Nine Faces"
slug: nine-faces
status: available           # available | sold | upcoming
collection: "Drop 001"     # which drop/collection this belongs to
description: "Short tagline or one-liner for the product"
price_range: "Inquire"     # display text, not a number
images:
  - src: nine-faces-01.jpg
    alt: "Front view of Nine Faces jacket"
  - src: nine-faces-02.jpg
    alt: "Detail of painted mask on back panel"
thumbnail: nine-faces-thumb.jpg
model_glb: nine-faces.glb  # optional, for 3D viewer
date: 2026-01-15           # date added to collection
---
```

## Body Content

The markdown body below the frontmatter contains the full product description. This renders on the individual product page.

```markdown
Hand-painted African tribal mask on a thrifted Levi's Type III trucker jacket.
Original wash, natural distressing. Mask design inspired by...
```

## File Naming

- Use the product slug as the filename: `{slug}.md`
- Image files referenced in frontmatter should be co-located or in a shared media directory (structure TBD based on SSG choice)

## Notes

- The `status` field controls visibility: `available` shows on the collection page, `sold` shows with a sold indicator, `upcoming` is hidden until changed
- The `model_glb` field is optional and references a .glb file for 3D model viewing (carrying over from Framer site)
