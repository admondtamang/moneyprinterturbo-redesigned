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
