# Media Pipeline

The Media Pipeline handles optimization of product imagery sourced from Scaniverse 3D scans. It takes raw exports (high-resolution images, video, .glb model files) and produces web-optimized assets: compressed images, thumbnails, and potentially video loops for product showcases.

## Interfaces

- **Inputs**: Raw Scaniverse exports (images, video, .glb files) placed in a source media directory
- **Outputs**: Optimized images, generated thumbnails, processed video loops consumed by Site Engine during build

## Constraints

- Image optimization must run automatically during the build step
- Must handle common image formats from Scaniverse exports (JPEG, PNG, HEIC)
- Thumbnail generation for collection gallery view
- Processing tools: TBD (likely sharp for images, ffmpeg for video)
- Video loop support is P2 -- not needed for initial implementation
- .glb 3D model handling: TBD (may carry over from Framer site or switch to 2D imagery)

## Data

No persistent module data. Source media is committed to the repo or provided as build inputs. Optimized output is generated during build and placed in the Site Engine's static assets directory.
