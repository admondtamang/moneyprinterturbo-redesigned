# Decisions log — MoneyPrinterTurbo

Dated rationale behind the rules in `CLAUDE.md`. Not loaded automatically; read it when a rule's history matters. Newest first.

## 2026-09-09 — Footage-to-script alignment (CLI pipeline)
Task: viral cat body-language short, 3 review rounds before upload.

Root cause of visible drift with `--match-materials-to-script` (real architectural limit, not a bug):
1. `material.py:_download_videos_by_script_order` (~line 1478) downloads round-robin across search terms (round 0 = each term's first result, ...) and stops the instant cumulative duration crosses `audio_duration`, mid-round, inside the `for search_term, term_items in candidate_groups` loop. Any term after the one that crossed the threshold gets no footage at all.
2. `video.py:combine_videos` (~line 602, sequential mode) takes only the first sub-slice (≤ `max_clip_duration`, argparse default 5s) of each downloaded file and concatenates. Caption timing comes from `subtitle_chunker.py` synced to real TTS word boundaries; nothing links it to which clip is on screen.

Mitigation chosen: content-level, no code changes — N short single-behavior sentences, N terms in order, clip duration such that N × duration > audio so the downloader completes in one round. Now the default workflow in `CLAUDE.md`.

Worked example: v1 (misaligned, 7.3s dead static ending) → v2 (rebalanced script fixed sync, one bad term) → v3 (single term swap, GO). Published: https://www.youtube.com/watch?v=aLfe1Lp0POY

Also today: `FiveCatMyths` (Remotion) reviewed in one round, no fixes needed — legibility, 7-word title layout, pacing, all 6 crossfades passed. Published: https://www.youtube.com/watch?v=ZamyCi599h8. Upload-Post quota after upload: 8/10 (cycle reset 2026-09-02).

## 2026-09-09 — Remotion pipeline added
`remotion-cat-video/` created as a second, independent pipeline. Shared components (`FactScene`, `FactsIntro`, `FactsOutro`) parameterized with props defaulting to the original `five-cat-facts` values. `FiveCatMyths` hook graded A: rapid context, contrast, specificity, credibility anchor.

## 2026-09-02 — Caption style, reference 2 ("podcast-clip" style) — CURRENT
Reference: all-caps bold captions, thick black outline, bottom-third placement, one keyword per line in a second color.
- Adopted: `subtitle_uppercase=True` (new `VideoParams` field + `--subtitle-uppercase`/`--no-subtitle-uppercase` flags), `BeVietnamPro-Bold.ttf`, `stroke_width=4`, `font_size=88`, `subtitle_position="bottom"`. Verified: fixed the white-on-light legibility failure from reference 1, even on a near-white sky.
- Limitation: Bold is the heaviest bundled weight; no true impact/black weight (Anton, Montserrat Black) in `resource/fonts/`.
- Built then reverted same day: per-word highlight of the final word (`_render_last_word_highlight_clip`, `subtitle_highlight_last_word`/`subtitle_highlight_color`, matching CLI flags). Fully removed from `schema.py`, `video.py`, `cli.py`. If reintroduced, the decided selection strategy is "always highlight the last word/phrase".

## 2026-09-02 — Caption style, reference 1 (`@PawWorld_kg`, "Many uses for cats.") — SUPERSEDED
- Placement moved from `top` preset (`video_height * 0.05`, `video.py:1244`) to `custom`, `custom_position=20`.
- Font `BeVietnamPro-Medium.ttf` (closest to the reference's generic UI sans; no exact match bundled).
- Color `#FFD400` yellow → `#FFFFFF` white. Tradeoff found by testing: white at stroke 1 was unreadable on pale blue-grey blanket and white bedsheet; stroke 2.5 was legible on mid-tones, still borderline on near-white. The old yellow/black combo had zero legibility failures on every background tested. All of this superseded by reference 2 the same day.

## 2026-09-02 — TTS voice
Edge TTS `en-US-JennyNeural` → Gemini native TTS `gemini:Sulafat-Warm` (reuses `gemini_api_key`, no new credentials). Verified by successful generation via `voice.py:gemini_tts`, not by listening. Other voices: `GEMINI_TTS_VOICES` in `app/services/voice.py:42`.

## 2026-09-02 — Caption crossfade
Added `fade_duration = min(0.15, duration / 3)` via `vfx.CrossFadeIn`/`CrossFadeOut` in `create_text_clip`. `vfx.FadeIn`/`FadeOut` (used elsewhere for audio) blend RGB toward black and would turn a transparent subtitle clip into a black blob; the mask-fade variants work because the subtitle is composited inside a `CompositeVideoClip`. Verified with a high-fps frame burst at a real caption boundary. Not gated behind a flag.

## 2026-09-02 — Other code changes
- `llm.py:44` `DEFAULT_SCRIPT_SYSTEM_PROMPT` constraint #9: first sentence must be a curiosity-gap question. Only applies without `custom_system_prompt`.
- `material.py:search_videos_pexels`: previously required an exact 1080×1920 match, discarding 4K renditions; now picks the highest-resolution rendition ≥ target.
- `upload_post.py`: `scheduled_date` + `timezone` params (Upload-Post native scheduling).
- `upload_post.py`: `youtube_extra["contains_synthetic_media"]` opt-out — still an uncommitted diff.

## 2026-09-02 — Upload-Post lesson
`upload_post_username` must be the dashboard profile name, not the login email. Using the email failed with `Username not associated with any profile`. First successful upload: https://www.youtube.com/watch?v=8wydXhjYTOE

## 2026-09-02 — Viral benchmark analysis
https://www.youtube.com/shorts/lIR1tJe6lrk — "Meow language: I love you", Potaroma Cats. 16.8M views, 98.8K likes, 1,500 comments, 8 seconds, uploaded 2024-12-16. Watched via frames + `yt-dlp -J`.

What it does: zero narration/TTS/script. Two clips (~4s "begging cat" on hind legs, ~4s macro kitten close-up). Static two-tier overlay for the whole 8s: yellow badge ("Meow language") + bracket "translation" (`【I LOVE YOU】`) + sound-on nudge line. All metadata in the title with 6 hashtags; no description; no CTA. Growth via shareability and loop-replay.

Why the pipeline can't clone it: (1) no narration-free mode — every run needs a script to drive TTS-timed subtitles; (2) no badge+bracket overlay independent of speech timing. Cloning needs (a) curated Pexels clip pair, (b) new overlay code in `video.py` — a feature, not a flag.

What transfers without code: much shorter runs (`--paragraph-number 1`, well under 30s); emotional/relatable hooks over dry facts; end on the strongest beat rather than a subscribe CTA.

## Open questions to resolve
- Is this a git repo? The old notes said "not a git repo" but also quoted `git status` output and asked for commits. Current `CLAUDE.md` assumes it is and forbids committing `config.toml`.
- The old defaults table marked `gemini:Sulafat-Warm` as superseded, but the referenced section makes it the current voice. `CLAUDE.md` keeps it as current. Confirm.
