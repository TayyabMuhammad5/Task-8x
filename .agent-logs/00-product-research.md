# Phase 0 — Product Research: Higgsfield AI

Research conducted: 2026-09-17, via live browsing with screenshots.

## What the product is

Higgsfield AI is an **AI media generation platform** — primarily video, secondarily image.
Users write a text prompt (optionally attach reference images/videos/audio), pick a model
and preset, and click Generate. The result appears in a history feed. Credits are consumed
per generation.

## The core loop (the one action users repeat)

1. **Enter a prompt** describing the visual they want
2. **Select model** (Seedance 2.5, Kling 3.0, Nano Banana Pro, GPT Image 2, etc.)
3. **Optionally** upload reference media, pick a preset/effect, set resolution/aspect ratio
4. **Click Generate** (costs credits, shown on the button e.g. "Generate ✦ 8Q 45")
5. **Wait** — loading state while the model processes
6. **See result** — video/image appears in the history panel
7. **Download/share** the result, or iterate with a new prompt

The core loop is: **prompt → generate → view result → iterate or download**.

## Page structure observed

| Page | URL | Purpose |
|------|-----|---------|
| Explore (Home) | `/` | Landing page with featured content, model cards, effects gallery |
| Image Studio | `/ai/image` | Text-to-image generation — prompt bar at bottom, model selector, settings |
| Video Studio | `/ai/video` | Text/image-to-video — left sidebar with model/preset/references, center canvas |
| Effects | `/effects/use` | Curated motion/VFX presets with "Try for free" buttons |
| Pricing | `/pricing` | Three tiers: Basic ($9), Pro ($23), Max ($59) — monthly credits |
| Auth | Modal overlay | Google, Apple, Microsoft, or Email — terms checkbox required |

## Visual design notes

- **Dark theme** — near-black background (#0a0a0a or similar), white text
- **Accent color**: **Neon yellow-green** (#d4ff00 / chartreuse) — used for CTAs, highlights, badges
- **Secondary accent**: Magenta/pink for "NEW" badges, "TOP" tags
- **Typography**: Bold, uppercase headings (likely a custom grotesque/display font), clean sans-serif body
- **Layout**: Full-width, card-based grid for effects/gallery, split-pane for studios
- **Navigation**: Horizontal top nav with text links + icon badges (New, Free, 30% OFF)
- **Auth modal**: Centered overlay, dark glass background, provider buttons stacked vertically

## What's worth copying

1. The **two-pane studio layout** (controls left, canvas/results center-right)
2. The **dark theme with neon-green accent** — it's distinctive and premium-feeling
3. The **prompt bar with inline model selector and credit cost** visible on the Generate button
4. **History panel** showing past generations in a feed
5. The **sign-up modal** design with social providers + email option

## What feels weak enough to improve on

1. **The homepage is unfocused** — too many product cards, promo banners, film festival ads, MCP plugins. A signed-out visitor doesn't immediately understand what to do. **Our improvement: a cleaner, more focused landing that drives straight to generation.**
2. **No public gallery** — there's no way to browse community creations without signing in. Effects are shown but not user-generated content. **Our improvement: a public explore/gallery page showing recent generations.**
3. **Credit costs are opaque** — you see "8Q 45" on the button but it's not immediately clear what that means. **Our improvement: clearer credit display and cost explanation.**

## Features that are secondary (for scoping)

- Multiple AI model providers (Seedance, Kling, Nano Banana, GPT Image, etc.)
- Video editing / extend video / motion control
- Audio generation
- MCP/API/ChatGPT plugin integrations
- Effects/preset library (250+ presets)
- Enterprise features
- Cinema Studio / After Effects integration
- Genjutsu (style transfer)

## Auth system

- Social providers: Google, Apple, Microsoft
- Email: manual entry with code/password
- Terms of Use checkbox required before proceeding
- Free credits on signup, bonus for business emails
