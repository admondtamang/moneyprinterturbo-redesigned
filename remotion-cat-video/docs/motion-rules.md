# thecatcourt — motion studio rules

Applies to every film rendered out of `src/reel/`. These are hard constraints, not style suggestions.
Adapted from the Opus 5.5 motion-studio method (see `docs/brief.md` for provenance).

## Render contract
- Every film is a pure function of `useCurrentFrame()`. Remotion gives us this for free — do not
  fight it. No `setTimeout`, no `requestAnimationFrame`, no CSS `transition` or `animation`,
  no `useState` that carries value between frames, no `Date.now()`, no `Math.random()`.
- Randomness only via Remotion's seeded `random(seed)`. Same frame must always paint the same pixels.
- 1080x1920 (9:16), 60 fps, H.264 yuv420p, CRF 16.

## Beat grid
- 120 BPM. 60 fps. **One beat = 30 frames. One bar (4 beats) = 120 frames = 2.0s.**
- Nothing starts on a frame that isn't derived from `beats.ts`. No hand-tuned magic frame numbers
  in scene code — import `beat(n)` / `bar(n)`.
- Scene changes land on downbeats. SFX land on beats. Text slams land on beats.
- Something new must happen on screen **every beat**, and a new visual idea every 2 bars.

## Look
- **Banned defaults** (an automatic fail in critique): centered title on a gradient; everything
  fading in; corner labels or frame borders; glow on UI chrome; generic particle bursts; drop
  shadows used as depth; emoji as iconography; dead time with nothing moving.
- One display face (Fraunces) and one UI face (Inter). No third face.
- One accent colour (`palette.gold`). Everything else is background, panel, or text.
- Type is the motion. Headlines arrive by mask-reveal, slam, or per-word stagger — never opacity
  alone, never a fade from nothing.
- The camera may scale, but never apply `will-change` to anything it scales (blurry text).
- Readable at 360px wide. Test every headline at that size before it ships.

## Motion
- Closed-form springs only (`src/reel/motion.ts`). A value with several targets is the **sum of one
  spring per change**, not a chain of interpolations.
- At most a tiny overshoot. Banned: bouncy easing, elastic, anticipation longer than 2 frames.
- One container never cuts: state changes are the same element changing size, radius and fill while
  its content swaps behind a short blur.
- Text inside a morphing container enters *after* the morph starts and leaves *before* the next one.

## Sound
- Score and SFX are synthesised in code (ffmpeg), never sampled. 120 BPM.
- Hits are placed on the beat grid, derived from the same constants the picture uses.
- Final mix normalised to **-14 LUFS**, true peak below -1 dBFS.

## Loop before showing anyone anything
1. Render one frame per beat as a contact sheet (`scripts/contact-sheet.sh`) and LOOK at it.
2. Score 1-10 on: hook in first 2s, readability at 360px, motion quality, variety, brand accuracy,
   composition, sound sync.
3. Write the 3 worst problems to `docs/review_log.md`. Fix them. Re-score.
4. Repeat until **every axis is 8+**. Only then do the full render.

## Loop check
- The last frame must equal the first — element positions and velocities included — so the short
  loops seamlessly when YouTube replays it.

## Engine notes (learned during build)
- `src/reel/*` runs on a **60 fps** grid. Every older composition (`FiveCatFacts`, `FiveCatMyths`,
  `CatVideo`) is 30 fps. Never import `src/reel/beats.ts` or `motion.ts` into those — the frame
  maths will silently not line up. The two systems coexist; they do not mix.
- Remotion's render is already a pure function of frame, so the render contract above is satisfied
  by the framework. Do not build an HTML/`window.seek(t)` harness to re-earn it.
- The beat grid is arithmetic, not measured. The score is synthesised at exactly 120 BPM, so there
  is nothing to detect — no librosa, no onset analysis. `beat(n)` is the single source of truth for
  both picture and sound.

## Picture/sound contract
- `src/reel/sfx.ts` is the **single source of truth** for which sound lands on which beat. Scene
  code keys its impacts off `sfxAt(n)` / `beatsWith(...)`; `scripts/generate-score.sh` synthesises
  the same table. If a hit moves, it moves in `sfx.ts` first, then in the score.
- `npx tsx src/reel/sfx.check.ts` guards it. This exists because the score and the shotlist were
  first authored in parallel and drifted — the score placed hits from the act structure, the
  shotlist placed them on visual events, and the two did not land together.
- A sound's perceived hit, not its file start, lands on the beat. Slow-attack sounds (whoosh,
  riser) are delay-compensated in the score script.
