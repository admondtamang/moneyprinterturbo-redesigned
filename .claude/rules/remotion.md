---
paths:
  - "remotion-cat-video/**"
---

# Remotion pipeline (`remotion-cat-video/`)

Code-driven React video: hand-drawn SVG icons + animated text on a fixed dark palette. No stock footage, so none of the CLI pipeline's footage-sync rules apply. Own `package.json` / `node_modules`. Currently untracked by git.

## Commands (run from `remotion-cat-video/`)
- Typecheck before every render: `npx tsc --noEmit`
- Render: `npx remotion render <CompositionId> out/<name>.mp4`
- Preview a single scene: `npm run dev` (per-scene compositions live in the `Folder` in `src/Root.tsx`)
- Voiceover: `npx tsx scripts/generate-voiceover-<name>.mts` (needs `GEMINI_API_KEY` in the shell env). Writes `public/voiceover/<VOICEOVER_DIR>/<id>.mp3` via `gemini-2.5-flash-preview-tts`; one retry with backoff on HTTP 429.

## One video = these five files
| File | Contents |
|---|---|
| `src/facts/<name>Data.tsx` | `Fact[]` — number, title, detail, `Icon` component |
| `src/facts/<name>Narration.ts` | `narrationLines` (`intro`, `fact-01`..`fact-0N`, `outro`), `NARRATION_VOICE` (Gemini prebuilt name, e.g. `"Charon"`), `VOICEOVER_DIR` |
| `scripts/generate-voiceover-<name>.mts` | Gemini TTS, one call per narration line |
| `src/Five<Name>.tsx` | `TransitionSeries`: `FactsIntro` → `FactScene`×N → `FactsOutro`; 15-frame crossfades; shared `public/audio/background.mp3` (never regenerate per video) |
| `src/calculateFive<Name>Metadata.ts` | `CalculateMetadataFunction` — reads real voiceover durations with `getAudioDuration`; scene frames = `ceil(seconds*30) + 20` tail buffer. This is what gives exact caption/scene sync for free. |

Then register in `src/Root.tsx`: one `Composition` for the full video with `calculateMetadata` wired in, plus a `Folder` of per-scene compositions.

## Rules
- To add a video, create the five files above. Do NOT fork `FactScene` / `FactsIntro` / `FactsOutro`. They take optional props (`voiceoverDir`, `title`, `subtitle`, `kicker`, `audioSrc`, `line1`, `line2`) that default to the original `five-cat-facts` values, so existing videos are unaffected.
- `icons.tsx` is additive only. Never remove or rename an export — other videos' data files reference icons by name.
- Do not backport `VOICEOVER_DIR` into the original `narration.ts` (it hardcodes `"five-cat-facts"` inline in 4 places). Leave it unless asked.
- Titles up to 7 words are verified to fit the scene layout without overflow or collision.
- Run `/video-review` on the rendered mp4 before any upload. Upload-Post rules in root `CLAUDE.md` apply.

## Backlog — not applied to any video yet
- Each fact scene holds a fully static frame for 5–7s after text/icon finish animating in. Add subtle idle motion (icon scale-breathing, drifting background gradient) if revisiting this template.

## Built so far
| Composition | Hook | Output | YouTube |
|---|---|---|---|
| `FiveCatFacts` | "5 Cat Facts You Didn't Know" | `out/five-cat-facts.mp4` | not tracked — check YouTube Studio |
| `FiveCatMyths` | "5 Cat 'Facts' That Are Actually Myths" / "Vets wish these would finally die" | `out/five-cat-myths.mp4` | https://www.youtube.com/watch?v=ZamyCi599h8 |
| `Rizz` | "You think you run this house" — mascot short, 14.3s | `out/rizz.mp4` | not uploaded |
| `RizzExplainer` | "How Rizz Gets Made" — pipeline explainer, 30.1s | `out/rizz-explainer.mp4` | not uploaded |
| `RizzTables` | "I ran a test" — why he knocks things off tables, 18.8s | `out/rizz-tables.mp4` | not uploaded |
| `RizzSleep` | "I am extremely well rested" — over stock footage, 16.9s | `out/rizz-sleep.mp4` | not uploaded |
| `RizzPurr` | "It was never about you" — over stock footage, 20.5s | `out/rizz-purr.mp4` | not uploaded |
| `RizzTalk` | "So I learned yours" — over stock footage, 17.2s | `out/rizz-talk.mp4` | not uploaded |

All three put Rizz bottom-right, mirrored (`flip`) so he angles into frame, lip-synced from Rhubarb cues.

- A plain short is a 10-line wrapper around `Short` in `components.tsx` (captions + cues + slug). Only the explainer has its own layout, because of the step strip.
- `Karaoke` sets `pageBreakAfter` on sentence-ending punctuation. Without it, time-based paging strands a sentence's last word at the head of the next page ("a test. Gravity") and reads as mistimed.
### Footage shorts (`FootageShort.tsx`)
Stock cat clips behind the mascot. A film is a 10-line wrapper: captions + cues + slug + `clipOffset`.
- Clips come from the **CLI pipeline's Pexels cache** (`storage/cache_videos`, 4.1GB) via `scripts/prep-footage.sh` → `public/footage/clip-NN.mp4` (portrait only, 1080x1920, 4s, silent).
- **Audit the prepped clips before rendering.** The cache is shared and holds non-cat footage — a network-graph animation, a floor/vacuum shot and a zipper close-up all landed in the first 14 and reached a render.
- Cuts land on **caption page boundaries**, not a timer, so the picture changes with the speech. Last shot runs to `durationInFrames` so the tail buffer isn't black.
- A gradient scrim sits over the footage — white captions over a pale cat are unreadable without it.
- Meow SFX: `scripts/generate-meows.mts` makes `public/audio/meow-{a,b,c}.mp3` from TTS pitched 1.5-1.8x. Pexels footage carries **no usable audio** (measured -91 dB, i.e. digital silence), so there is no real meow to sample. One stinger on the hook, one as the button.
- Footage GIF previews need `fps=8 scale=220 max_colors=96` — at the flat-background settings they come out 10-14MB.

- **Known issue:** TTS loudness varies per take — rizz -17.8 dB, tables -21.9 dB, explainer -25.7 dB mean. Noticeable on phone speakers across a series. Fix is a `loudnorm` pass on the mp3 in `generate-voiceover-rizz.mts` (safe: it does not change duration, so whisper/Rhubarb cues stay valid). Not applied yet.

## `src/rizz/` — Rizz, the karaoke-caption mascot short (30 fps)

Per-word caption highlighting driven by real whisper timings, not estimates.

| File | Purpose |
|---|---|
| `src/rizz/script.ts` | `narrations` slug→text registry, Gemini voice, `CAT_PITCH` |
| `scripts/generate-voiceover-rizz.mts` | TTS → `<slug>.clean.wav` (16k, for whisper) + `<slug>.mp3` (cat-pitched, for render) |
| `scripts/transcribe-rizz.mts` | whisper.cpp `base.en` → `src/rizz/captions.<slug>.json` |
| `src/rizz/components.tsx` | Shared `Mascot` (bob + Rhubarb lip sync) and `Karaoke` (per-word highlight) |
| `scripts/lipsync-rizz.mts` | Rhubarb → `src/rizz/visemes.<slug>.json` (A-F mouth cues) |
| `scripts/build-mascot-sprites.py` | Grid → six registered `rizz-mouth-{A..F}.png` |
| `scripts/generate-mascot.mts` | Nano Banana Pro via the Gemini API (needs PAID key) |
| `src/rizz/Rizz.tsx`, `src/rizz/Explainer.tsx` | The two compositions |
| `src/rizz/calculateRizzMetadata.ts` | `audioDurationMetadata(slug)` — duration from the real mp3 |

Both generator scripts take the slug as argv (default `rizz`):
`npx tsx scripts/generate-voiceover-rizz.mts explainer && npx tsx scripts/transcribe-rizz.mts explainer`

- Regenerate order: voiceover → transcribe → render. Changing a narration invalidates its `captions.<slug>.json`.
- `Explainer.tsx` anchors its step strip by looking each step's `keyword` up in the word timings, so the strip cannot drift from the voice. Renaming a step label means checking its keyword is still spoken — a missing keyword throws at module load rather than rendering a silently dead strip. `writes` is spoken twice; the step takes the first hit.
- **Transcribe the clean wav, never the pitched mp3** — whisper mishears the chipmunk voice. `asetrate`+`atempo` keeps both files the same length (measured 16ms apart), so the timings are valid for either.
- Whisper emits sub-word tokens (`" R"` + `"iz"`); `transcribe-rizz.mts` folds continuation tokens (no leading space) back into whole words before writing. Per-word karaoke needs whole words.
- Full asset regen: voiceover → transcribe → lipsync → (regenerate grid) → `build-mascot-sprites.py` → render.
- **Mouth sprites must come from ONE grid generation.** Six separate image-model runs do not register (measured: 810x940 reference returned as 960x1088, zoomed, gaze shifted). Even within one grid the model re-renders the fur per panel (8.5-13.3/255 non-mouth diff), so `build-mascot-sprites.py` transplants ONLY the mouth box onto panel A's body with a 14px feather. Verified result: 0.00 diff outside the mouth, 12.9-20.1 inside.
- Sprites are 384x458 — sized for a bottom-corner mascot (~400px on a 1080 frame). NOT enough for a centred mascot at 620px; regenerate the grid larger if that's ever needed.
- `Mascot` mounts all six sprites and toggles opacity. Swapping `src` instead decodes mid-render and flashes.
- Gemini image generation needs a PAID API key — the free tier returns `limit: 0` for every image model, including `gemini-3-pro-image`. The grid was made in Google Antigravity instead (free, has Nano Banana Pro). See `docs/prompts/ANTIGRAVITY-HANDOFF.md`.
- `rhubarb/` is an 87MB gitignored binary, like `whisper.cpp/`.
- Legacy `public/mascot/rizz.png` and `rizz-X.png` are no longer rendered; `rizz-X.png` is the reference for regenerating the grid.
- Superseded note: mascot was `public/mascot/rizz.png` centred (2026-10-24). Replace by overwriting in place — no code change. Requirements: RGBA PNG, **cropped tight to the subject** (`width: 620` sizes the canvas, not the cat), aspect no taller than 1:1.39 (renders 620x800; captions start at y≈1210), ≥620px wide, no light edge fringe (glows on `#14100d`), no baked ground shadow (the image bobs ±14px and squashes).
- `whisper.cpp/` is a ~150MB build artifact in the project root. Keep it out of git.

## `src/reel/` — the motion-studio pipeline (Film 01 onward)
A second, separate pipeline from the `facts` videos above. **60 fps**, beat-grid driven, no
voiceover. Method adapted from Lukas Margerie's Opus 5.5 motion-graphics workflow
(youtube.com/watch?v=747ZnEtsRbg), studied 2026-10-04.

**Never import `src/reel/*` into the 30fps `facts` videos** — the frame maths will silently not
line up. The two systems coexist; they do not mix.

### The harness (read these before touching a film)
| File | Purpose |
|---|---|
| `docs/motion-rules.md` | The contract: render purity, beat grid, **banned defaults**, sound spec, the 8+/10 gate |
| `docs/brief.md` | Director's brief — logline, beat sheet, brand, workflow gates |
| `docs/type-scale.md` | Measured type budget. **Read the "Use" column, not the "Floor" column** |
| `docs/shotlist.md` | Per-beat table + sources for every on-screen claim |
| `docs/sound.md` | Per-beat SFX map |
| `docs/review_log.md` | Scored critique rounds |

### Shared contracts — if two acts both draw a thing, neither act owns its number
`src/reel/beats.ts` (grid), `motion.ts` (spring idioms), `glyphs.tsx` (SVG), `stage.ts` (loop
geometry + `TABLE_STROKE` + `TABLEAU`), `sfx.ts` (beat→sound, the picture/sound contract).
Guarded by `npx tsx src/reel/{motion,sfx}.check.ts`.

### Workflow — do not skip the gate
1. `scripts/contact-sheet.sh TheCatCourt01 <round>` → draft render + one frame per beat + a
   **360px readability strip**.
2. **Look at the strip.** Score 7 axes in `docs/review_log.md`. Fix the 3 worst. Repeat.
3. Only when **every axis is 8+**: `scripts/final-render.sh TheCatCourt01 <name>`.

### Lessons that cost rounds — do not rediscover
- Full-res frames look fine while the 360px strip fails. Review at 360px.
- But the strip is **not sufficient**: a mid-transition frame hid a clipping bug that only showed
  at full res. Spot-check transitional beats at full resolution too.
- A heavy blur on a near-white fill reads as a **banned glow orb** at phone size.
- A ring centred between two lines of type **bisects both by construction**. Offset it.
- Low contrast reads as illegible before small size does (`textMuted` on `panel` failed).
- Parallel agents drift: the score and shotlist disagreed on SFX placement; Hook and Lockup
  disagreed on stroke weight. Both fixed by a single shared constant, not by coordination.
- Verify the loop with a **pixel diff**, not by eye. A moving element must differ by exactly one
  frame of travel; everything else must be identical.

### Built
| Composition | Hook | Output |
|---|---|---|
| `TheCatCourt01` | "IT DID NOT FALL" — *The State v. The Cat*, 22s, 1080x1920@60 | `out/thecatcourt-01.mp4` |
