# Session: Real Image Generation (Pollinations.ai)

**Date**: 2026-09-18
**Goal**: Replace mock image generation with real AI image generation while keeping video mocked.

## Changes Made
1. **`src/lib/GenerationProvider.ts`**:
   - Replaced the local `picsum.photos` placeholder for images with a real call to `https://image.pollinations.ai/prompt/[prompt]`.
   - Added `seed` parameter with a random number (`Math.floor(Math.random() * 1000000)`) so identical prompts generate different variations.
   - Added `&width=1024&height=1024&nologo=true` parameters for high-quality, watermark-free results.
   - Implemented a preloading mechanism using the browser's `Image` object. This ensures the DB row is only updated to `completed` *after* the image has fully downloaded and is ready to be displayed, preventing broken image states.
   - Added a 20-second timeout. If Pollinations.ai takes too long or fails, the generation is marked as `failed` in the database.
   - Kept the video generation path entirely mocked (using MDN CC0 videos) due to time constraints and lack of a free, unauthenticated video endpoint.
   - Kept the credit deduction logic exactly as it was (deducts atomically before inserting the pending row, per earlier fix).

## Notes
- Pollinations.ai is used because it offers a free, unauthenticated endpoint that returns the image directly as the HTTP response (no JSON parsing needed).
- Error states for `failed` generations were already implemented in the UI (`GalleryPage` and `GenerationDetailPage`), so no UI component changes were needed to support this failure path.
