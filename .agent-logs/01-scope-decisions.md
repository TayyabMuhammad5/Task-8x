# Phase 1 — Scope Decisions

Written: 2026-09-17T17:11Z (before any feature code)

## What we're building, in priority order

### P0 — Core loop (must ship, fully working, deployed)

**Prompt → Generate → See result → Gallery**

1. **Image generation page** (`/`) — prompt input bar, model selector dropdown, aspect ratio picker, Generate button with credit cost
2. **Mock generation provider** — simulated 3-5 second delay, returns a placeholder AI-generated image. Entire loop works end-to-end before touching any real API
3. **Gallery page** (`/gallery`) — grid of user's past generations, newest first, with status badges (generating / completed / failed)
4. **Generation detail page** (`/generations/:id`) — full result view with download button, prompt text, timestamp, model used
5. **Loading states** — visible spinner/progress on the generation page while "generating"

### P1 — Supporting system: Auth + persistence (required for core loop to work)

**Decision: Auth is load-bearing.** Without it, there are no users, no credits, no saved generations. Persistence is inseparable from auth — a gallery needs a user_id.

- **Supabase** for both auth (email + magic link, simplest) and Postgres database
- Data model:
  ```
  User: id, email, credits (default 50), created_at
  Generation: id, user_id, prompt, model, status, result_url, aspect_ratio, created_at
  ```
- Credits deducted on generate, checked before allowing generation

### P2 — UI polish (only screens a judge will see)

- Dark theme matching Higgsfield's aesthetic (near-black bg, neon-green accent)
- Responsive layout — works on desktop and mobile
- Smooth transitions and micro-animations
- Professional typography (Inter or similar)
- The generation page is the hero — it gets the most polish

### P3 — Nice-to-haves (only if time remains)

- [ ] Wire in a real image generation API (fal.ai or Replicate) after mock is deployed
- [ ] Public explore page with community generations
- [ ] User profile / settings page
- [ ] Multiple model support with different credit costs
- [ ] Image upload as reference input

## Deliberate cuts (not building these)

| Feature | Reason |
|---------|--------|
| Video generation | Complexity of video processing; images show the same core loop |
| Audio generation | Secondary product, not core |
| Effects/preset library | Content-heavy, no impact on core loop demonstration |
| Social auth (Google/Apple) | OAuth setup overhead; email auth proves the pattern |
| Pricing/payment page | No Stripe integration needed for a demo |
| MCP/API/ChatGPT integrations | Platform features, irrelevant to core UX |
| Image-to-video / extend video | Advanced feature, cut |
| Motion control / camera presets | Video-specific, cut |
| Enterprise features | N/A |

## Stack decisions

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + TypeScript + Vite + Tailwind | Per assignment spec. Fast, modern, good DX |
| Backend | Supabase (Auth + Postgres + Storage) | Zero backend code needed for auth + DB + file storage. Free tier. Fastest to deploy |
| Generation | MockProvider first, then fal.ai | Mock gets us deployed fast. fal.ai has simple API for real images if time allows |
| Deploy | Vercel | Free, instant deploys from Git push, handles SPA routing |

## One thing we do better than Higgsfield

**A focused, clean generation experience.** Higgsfield's homepage is cluttered with promo banners, film festival ads, and too many product cards. Our version drives the user straight to generation with a clean, beautiful interface. The generation page IS the homepage — no marketing fluff between the user and the product.

## Deployment strategy

1. Get Vite + React scaffolded and deployed to Vercel with a hello-world → **first deploy**
2. Build generation page with MockProvider → **second deploy**
3. Add Supabase auth + DB → **third deploy**
4. Add gallery + detail pages → **fourth deploy**
5. Polish UI → **fifth deploy**
6. (If time) Wire real AI API → **sixth deploy**
