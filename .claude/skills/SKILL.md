---
name: video-review
description: Pre-upload QA of a rendered Short from either pipeline (CLI or Remotion). Use this before every Upload-Post / YouTube upload, whenever the user asks to check, review, verify, QA, or "watch" a rendered video, and between iteration rounds when tuning --video-script / --video-terms / --video-clip-duration. Do not skip it because the render "looked fine" in the log.
---

# Video review — pre-upload QA

## Inputs
- Path to the rendered `.mp4`
- The script (CLI: the `--video-script` text; Remotion: `narrationLines`)
- CLI only: the `--video-terms` list, in order
- Caption style in use (font, size, stroke, position, uppercase)

## Procedure
1. Extract frames manually. The `/watch` skill is broken on this machine (`-vsync` rejected by `ffmpeg n9.0.1`), so run:
   ```bash
   mkdir -p review && ffmpeg -i <video> -vf "fps=2,scale=512:-1" review/%04d.png
   ffprobe -v error -show_entries format=duration -of csv=p=0 <video>
   ```
   For a remote URL, `yt-dlp` it first.
2. Read every extracted frame. For each sentence / scene, check:
   - **Legibility** — fail if any frame has caption text blending into the background.
   - **Sync + chunking** — captions match what is being spoken at that moment (CLI: compare against `subtitle.srt`).
   - **Relevance** — footage/scene matches the sentence actually being narrated over it, not a neighbouring one.
   - **Pacing** — flag any static frame held for a large share of runtime.
   - **Hook** — first ~2s must open a curiosity gap.
   - **Transitions** — no black flashes at caption or scene boundaries.
3. Give a verdict: `GO` or `NO-GO`, plus exactly ONE concrete highest-impact fix.
4. If `NO-GO`, apply only that fix — to `--video-script` / `--video-terms` / `--video-clip-duration` (CLI) or `<name>Data.tsx` / `<name>Narration.ts` (Remotion) — re-render, and repeat. Stop after 3 rounds and report.

Delegate step 2 to a `general-purpose` subagent when the frame count is large. Hand it the video path, script, terms, and caption style verbatim, and require the output format below.

## Output format
```
Round N — GO | NO-GO
Legibility: ...
Sync/chunking: ...
Relevance, per sentence: 1. ... 2. ... N. ...
Pacing: ...
Hook: ...
Transitions: ...
Highest-impact fix: <one change>
```

## Reference
Worked example (3 rounds, CLI pipeline, 2026-09-09): v1 misaligned footage + 7.3s static ending → v2 rebalanced script fixed sync, one bad term left → v3 single term swap, GO. Details in `docs/decisions-log.md`.
