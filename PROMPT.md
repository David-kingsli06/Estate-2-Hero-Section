# Cedar Ridge — Hero Build Prompt

> This file documents the original prompt used to generate the Cedar Ridge scroll-driven hero section.

---

## Project Overview

Build a full-screen, scroll-driven hero for **"Cedar Ridge"**, a residential development of sand-beige homes on a beach. The hero plays a 192-frame image sequence scrubbed slowly by scroll, showing the development's construction in four stages: a 3D blueprint on the sand, the lines becoming foundations, the homes being assembled, and the finished homes by the sea. A poster image shows immediately on load. Text sits on the left, the homes on the right. Keep everything calm, slow, and photographic. No bouncing, no overshoot, no playful motion.

---

## Skills Applied

### Taste
Sets the visual direction.

| Token | Value | Usage |
|---|---|---|
| Sand Beige | `#D8C3A5` | Background tone around frames |
| Warm Ink | `#2B2620` | Headlines and sublines |
| Cedar | `#8A5A3C` | Accent line |
| Warm Stone | `#5C5043` | Secondary text |

Never use pure white or pure black.

### Impeccable Design
Governs layout, typography, and spacing.
- Serif display face for headlines and wordmark: **Cormorant Garamond**
- Clean sans for sublines: **Inter**
- 8 px spacing steps
- Side margins of at least 6vw

### Emil Design Engineering
Governs motion and interaction.
- Eased, damped scrubbing with no snapping and no bounce
- Every text animation must finish before the next stage begins

### Conflict Rule
- Taste vs Impeccable → Taste wins on **color and mood**, Impeccable wins on **layout and type**
- Either vs Emil on motion → Emil wins on **timing**, result must still feel calm

---

## Stack

- **Next.js 15 (App Router)**, TypeScript (strict), Tailwind CSS v4
- Frame scrubbing on a single `<canvas>`, no 3D libraries
- **GSAP ScrollTrigger** for scroll tracking and text timing
  - *Justification: GSAP ScrollTrigger provides cross-browser scroll position normalization and sub-pixel scrub fidelity without hijacking native wheel or touch momentum. Coupling its listener to a continuous RAF lerp loop decouples rendering from jittery input events.*
- Scroll smoothing: lerp factor **0.04** per animation frame (updated from initial 0.06 for a slower, more cinematic glide)

---

## Concept

### Pinned Hero
- Section height: **600vh** (updated from 400vh for slower scrubbing)
- Sticky viewport: **100vh**
- Scroll progress `p` runs from `0` to `1` across the pinned section
- `p` drives: frame index, active stage, stage counter, and all text animations

### Frame Index Mapping
```
frame index = round(p × 191)
```
Frame 0 at `p = 0`, frame 191 at `p = 1`.

### Stages (each a quarter of the scroll)

| Stage | p Range | Frames | Clip Description |
|---|---|---|---|
| 1 | 0 → 0.25 | 0 – 47 | 3D blueprint on the beach |
| 2 | 0.25 → 0.5 | 48 – 95 | Lines become foundations, rebar rises |
| 3 | 0.5 → 0.75 | 96 – 143 | Walls, windows, and roofs assembled |
| 4 | 0.75 → 1.0 | 144 – 191 | Camera approaches finished homes at dusk |

Stage boundaries are defined in `lib/frames.ts`. Changing one value updates the whole hero.

---

## Frame Assets

- Frames: `/public/frames/frame_000.webp` through `frame_191.webp`, at **1920×1080**
- Poster: `/public/cedar_ridge_poster_16x9.jpg`, 16:9, generated from `frame_000.webp`
- Poster is displayed immediately on load with `object-fit: cover` and the same **104% crop** used for frames
- **Crossfade**: when frame 0 has decoded and been drawn to the canvas, fade the canvas in (600 ms), then remove the poster
- Preload all 192 frames in the background after the poster is visible
- Thin progress hairline in cedar `#8A5A3C` during loading
- Each frame decoded with `new Image()`, stored in an array
- Each frame drawn centered and filling the canvas using object-fit: cover logic, `imageSmoothingQuality = "high"`
- **104% crop**: each frame cropped to 104% of canvas, centered, to hide edge artifacts
- Canvas backing store capped at DPR `[1, 2]`
- Frame index stays integer — no interpolation between frames

> **Note:** Stage 2 contains a short held final frame at its end, so a brief pause is expected and intentional.

---

## Motion

| Element | Behaviour |
|---|---|
| Frame scrubbing | Linear mapping from `p` to frame index, lerp (`0.04`) applied to `p` before mapping |
| Stage headline | Rises 24 px, fades opacity 0 → 1, blur 8 px → 0 px. Duration 900 ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Lines stagger 120 ms |
| Stage subline | Fades 0 → 1, 700 ms, starts 300 ms after headline. No movement |
| Wordmark (stage 4) | Letter spacing 0.4em → 0.08em, opacity 0 → 1 as `p` crosses 0.8, over 1400 ms |
| Stage counter | Current number cross-fades 400 ms on stage change. `/ 04` stays fixed |
| Scroll cue | 40 px cedar line pulses (opacity 0.3 ↔ 0.8, 2 s cycle). Stops after `p = 0.02` |

**Rule:** Use `transform` and `opacity` only. Never animate layout properties.

---

## Overlay Text (Exact Copy)

| Stage | Headline | Subline |
|---|---|---|
| 1 | `Drawn on the land.` | Every home begins as a plan on the ground. |
| 2 | `Rooted in the sand.` | Foundations set, steel placed with care. |
| 3 | `Built, piece by piece.` | Walls, windows, and roofs, each set with precision. |
| 4 | *(Wordmark)* `Cedar Ridge` | Homes by the sea. Ready for you. |

Stage 4 has **no headline** — only the wordmark and subline.

**Stage counter:** top-right corner, `01 / 04`, sans face, 14 px, tracking 0.2em, `#2B2620` at 70% opacity.

### Typography

| Element | Desktop | Mobile | Line Height |
|---|---|---|---|
| Serif headlines | 56–72 px | 40–48 px | 1.1 |
| Sans sublines | 16–18 px | 16–18 px | 1.5 |
| Wordmark (stage 4) | 96 px | 64 px | 1.1 |

Text-shadow: `0 1px 16px rgba(243, 235, 222, 0.5)` for legibility.

---

## Layout

### Desktop (≥ 1024 px)
- Text: left column, `left: 6vw`, `width: 34vw`, vertically centered
- Homes: right 60% of the frame
- Minimum 24 px gap between text and nearest building

### Mobile (< 768 px)
- Text: top 35% of the viewport
- Scene: lower 60%
- Wordmark stays in top 35% in stage 4

Stage counter stays top-right on all sizes, never overlaps a building.

---

## Behaviour & Accessibility

| Concern | Behaviour |
|---|---|
| Reduced motion | Skip scrubbing, canvas, text animation. Show poster as static background with stage 4 wordmark/subline. Remove scroll cue. |
| Touch | Native touch scroll. No touch event hijacking. |
| Low-end devices | If `navigator.hardwareConcurrency < 4`, draw every second frame (index rounded to nearest even) |
| Contrast | All text meets WCAG AA. Soft left gradient for subline over bright frame areas to reach 4.5:1 |
| Canvas ARIA | `role="img"`, `aria-label="Cedar Ridge homes built on a beach, shown from a 3D blueprint on the sand through foundations, assembly, and the finished homes at dusk."` |
| Headings | First headline is `h1`, stages 2–3 use `h2`, wordmark is a styled `p` |

---

## File Structure

```
realeastate_two_hero/
├── app/
│   ├── layout.tsx          # Root layout, Cormorant Garamond + Inter fonts, metadata
│   ├── page.tsx            # Renders the Hero
│   └── globals.css         # Tailwind v4 import, brand CSS tokens
├── components/
│   ├── Hero.tsx            # Pinned 600vh section, sticky 100vh, scroll tracking, poster display
│   ├── FrameCanvas.tsx     # Canvas, frame preloading, 0.04 lerp smoothing, cover crop, crossfade
│   └── HeroOverlay.tsx     # Stage text, wordmark, stage counter, scroll cue animations
├── lib/
│   ├── frames.ts           # TOTAL_FRAMES (192), stage config, mapProgressToFrame, getFramePath
│   └── useReducedMotion.ts # Reduced-motion hook
└── public/
    ├── cedar_ridge_poster_16x9.jpg   # Poster (generated from frame_000.webp)
    └── frames/
        ├── frame_000.webp
        ├── frame_001.webp
        └── … frame_191.webp
```

---

## Install Commands

```bash
# 1. Create Next.js app
npx create-next-app@latest realeastate_two_hero --typescript --tailwind --app

# 2. Install GSAP
npm install gsap @gsap/react

# 3. Add frame assets
# Place /public/frames/frame_000.webp through frame_191.webp
# Place /public/cedar_ridge_poster_16x9.jpg (from frame_000.webp, 16:9 JPEG)

# 4. Start dev server
npm run dev
```

---

## Customization Guide

| What | Where | How |
|---|---|---|
| Colors | `app/globals.css` | Edit `--color-sand`, `--color-ink`, `--color-cedar`, `--color-stone` |
| Stage text | `components/HeroOverlay.tsx` | Edit the `STAGES` array: `headline`, `subline` |
| Scroll travel (speed) | `components/Hero.tsx` | Change `h-[600vh]` to any height (taller = slower scrub) |
| Lerp damping | `components/FrameCanvas.tsx` | Change `0.04` — lower glides longer, higher follows scroll closer |
| Stage timing | `lib/frames.ts` | Edit `startP`, `endP`, `startFrame`, `endFrame` per stage |
| Frame sequence swap | `public/frames/` + `lib/frames.ts` | Re-extract WebP frames, update `TOTAL_FRAMES` and stage frame ranges |
| Poster swap | `public/cedar_ridge_poster_16x9.jpg` | Replace file; keep 16:9 ratio for seamless crossfade alignment |

---

## Skill Alignment Summary

| Skill | Impact |
|---|---|
| **Taste** | Sand beige `#D8C3A5` background, warm ink `#2B2620` headlines, cedar `#8A5A3C` accents, warm stone `#5C5043` sublines. Pure whites and pure blacks avoided throughout. |
| **Impeccable Design** | Cormorant Garamond (serif) + Inter (sans). Strict 8 px grid, desktop 6vw margins, 34vw left-column layout with buildings clear in the right 60%. Mobile typography pinned to upper 35%. |
| **Emil Design Engineering** | Zero-overshoot, non-snapping `0.04` damped lerp on the canvas scrub. Stage text rises with `cubic-bezier(0.22, 1, 0.36, 1)` and finishes completely before subsequent stages. No layout properties animated. |
