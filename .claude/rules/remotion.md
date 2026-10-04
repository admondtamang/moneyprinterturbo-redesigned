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
