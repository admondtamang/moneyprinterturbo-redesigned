# @thecatcourt — Monetization Playbook

**TL;DR**
- Status: 7,670 subs (YPP sub-bar CLEARED for both tiers). Blocker is views/watch-hours, not subs.
- Verified against: channel data pulled 2026-10-02 (31 videos), YPP policy research 2026-10-02.
- Target: Tier 2 = 10M Shorts views / 90 days, OR 4,000 long-form watch hours / 12 months.
- Current run-rate: ~1,200 views/video. **10M/90d needs ~111,000 views/day. Gap is ~100x.**
- Chosen strategy: original narrated Shorts, 18-25s, daily. Rationale and evidence below.
- Edit this file freely — the pipeline reads `ideas.yaml` and `config.yaml`, not this doc.

---

## 1. Where the channel actually stands

| Metric | Value | Source |
|---|---|---|
| Subscribers | 7,670 | yt-dlp channel pull, 2026-10-02 |
| Total views | 6,225,570 | sum of 31 videos |
| Views from ONE video | 6,100,783 (98.0%) | `x3deDaYK4R8` |
| Median views, all other videos | ~1,200 | n=30 |
| Sub conversion from the viral hit | 0.13% | 7,670 / 6.1M |
| Reach vs launch | down 3-10x | cohort views/day analysis |

**The hard truth:** the subscriber base is inherited from one viral clip and does not watch new uploads.
Treat subscriber count as a vanity number here. The only metric that matters is per-video reach.

## 2. What the data says works

Winners = 4 videos over 10k views. Every one is a compilation uploaded in the channel's first 7 days.

| Factor | Winners (n=4) | Long tail (n=11) |
|---|---|---|
| Duration | 18-34s (median 28.5s) | median 46s |
| Title style | vibe / curiosity hook | numbered list ("5 Cat Myths...") |
| Emoji in title | 4/4 | 2/11 |
| Tag count | 0-3 | 5-8 |
| Like rate (median) | 3.39% | 1.77% |
| Description | short, with comment prompt | long bullet-list of facts |

Derived rules (what the pipeline enforces):
1. **18-25 seconds.** Every video over 40s underperforms. The best recent upload was 19s.
2. **Curiosity hook titles, not numbered lists.** "Two cats. Two moments. Zero thoughts" beat every "5 Facts" title.
3. **1-2 emoji in the title.** Present in 4/4 winners.
4. **<=3 tags.** Tags are INVERSELY correlated with views here. Do not tag-stuff.
5. **Short description ending in a comment prompt.** Winners asked a question; the tail listed facts.
6. **Post daily. Never gap.** A 30-day gap (Jun 6 - Jul 6) killed launch momentum and it never recovered.

### Confound — read before trusting rule ordering
Content type and era are almost perfectly confounded: every pre-August upload is a compilation,
every September upload is narrated. "Compilations win" and "launch-era uploads win" cannot be fully
separated from public data. The age-independent evidence that content type genuinely matters is the
like-rate gap (3.39% vs 1.77%). The counter-signal is `QWB9hNSf8jM` — narrated, 19s, and the best
day-1 of any recent upload (1,163 views). **Working hypothesis: duration + hook matter more than
compilation-vs-narrated.** The daily cadence below is designed to test this quickly.

## 3. Monetization constraints — why we do NOT clip other channels

| Policy | What it says | Applies to |
|---|---|---|
| [Reused Content](https://support.google.com/youtube/answer/1311392) | content repurposed "without adding significant original commentary, substantive modifications, or educational or entertainment value". Violation example: "Clips of moments from your favorite show edited together with little or no narrative." | The compilations — incl. the 6.1M hit |
| Inauthentic Content (renamed from "repetitious", 2025-07-15) | "AI-generated content made with generic or unoriginal templates giving the impression of mass production" | Mass-produced AI music loops |

YPP review assesses the channel as a whole, not per video. The compilations that drive 98% of views
are the single biggest risk to the application. **Decision (2026-10-02): keep them for now, build
original alongside, revisit privating them immediately before applying.**

This is also why the pipeline uses only Pexels/Pixabay footage (license permits commercial use) and
writes original scripts. Reuploading third-party clips would grow views faster and get YPP rejected.

## 4. Realistic path — stated honestly

Neither path is easy from here:

- **Shorts path:** 10M views / 90 days = ~111k views/day sustained. At the current ~1,200/video this
  needs a ~100x improvement. Requires repeat virality, not consistency alone.
- **Long-form path:** 4,000 watch hours / 12 months. More forgiving window, but the channel has no
  long-form audience — the 3.5h music video `E3pzkvnXEWI` got 1 view. Building long-form watch time
  means building a new audience from zero.
- **Tier 1 (fan funding)** at 500 subs + 3k watch hrs or 3M Shorts views/90d is a nearer milestone
  and worth treating as the real next target.

Reported but UNVERIFIED: thresholds may rise to 8,000 hrs / 20M Shorts views on 2027-02-01.
Not confirmed on an official Google page — re-check before planning around it.

## 5. Current experiment

**Hypothesis:** original narrated Shorts at 18-25s with curiosity-hook titles can match the
compilations' reach, making the channel both monetizable and growing.

**Test:** daily upload for 14 days. Success = median views/video over the last 7 uploads exceeds
2,741 (the compilation median). Failure = still under ~1,200, at which point revisit format.

**Kill criterion:** if 14 daily uploads do not beat 1,200 median, the format is not the problem —
distribution is, and we stop producing and re-diagnose using YouTube Studio retention/CTR data
(which is NOT available via public API; you must export it).

### 5b. Secondary test — broader-appeal hypothesis

**Observation:** `nJ8MV34vg_0`, the channel's only non-cat upload (a Minecraft compilation),
got 11,293 views — more than every cat fact video ever posted.

**Hypothesis:** the audience is short-form-comedy, not cat-specific.

**Evidence strength: WEAK.** n=1, and that video was also a compilation from the launch window,
so content-type and era confounds are unresolved. Treat as a cheap probe, not a finding.

**Test:** 2 non-cat ideas queued (`2026-10-08-owl-head`, `2026-10-09-dog-nose`), same format —
original script, licensed footage, 18-25s. Compare their day-7 views against the cat cohort.

**Brand risk:** the channel is "thecatcourt". Heavy non-cat content may weaken the algorithm's
topic association and alienate the inherited sub base. **Cap: 2 non-cat per 7 uploads.**
If the non-cat pair wins decisively, raise the cap deliberately — do not drift into it.

## 6. What I need from you

| # | Need | Why | Status |
|---|---|---|---|
| 1 | YouTube Data API OAuth credentials | Upload-Post caps at 10/month and 4GB; daily needs ~30/month | BLOCKING daily uploads |
| 2 | Rotate the Upload-Post API key | It was leaked into a chat transcript on 2026-10-01 | SECURITY |
| 3 | YouTube Studio analytics export (CTR, retention) | Public metadata cannot tell us whether weak videos fail on thumbnail or on retention | Improves targeting |
| 4 | Your feedback on each day's video | You said you'd review; the pipeline logs each upload to `logs/` for this | Ongoing |
| 5 | **Original cat footage** (film your own, or a source) | The single biggest quality ceiling. Stock cannot produce candid comedy moments — this is what separates us from the 1.7M reference | HIGHEST LEVERAGE |
| 6 | A royalty-free music library you like (or approval to pick one) | The synth bed is built for sleep ambience and is the wrong mood for comedy bits | Blocks format v2 |

## 7. Changelog
- 2026-10-02 — Playbook created. Channel + policy research done. Format rules derived from 31-video analysis.
- 2026-10-02 — Uploaded `E3pzkvnXEWI` (3.5h music loop). Got 1 view. Logged as a format misjudgement:
  built for a different channel's audience without checking this channel had no long-form viewers.
- 2026-10-02 — Pipeline built and live. systemd timers: produce daily 09:12, status 09:40 + 20:40.
- 2026-10-02 — Published `n7UzlK3_th8` "Your cat sits like bread for a reason" (18.9s) — first
  pipeline upload, starting daily cadence immediately rather than waiting for the timer (gaps are
  what killed this channel's momentum in Jun-Jul 2026).
- 2026-10-02 — Added 5b broader-appeal A/B test (2 non-cat ideas) at a 2-per-7 cap.

## 8. Baseline to beat (set 2026-10-02)
Measure the next 14 daily uploads against these, pulled 2026-10-02:
- Median views, all non-viral videos: ~1,200
- Compilation median (the bar for "format works"): 2,741
- Best recent day-1: 1,163 (`QWB9hNSf8jM`, 19s narrated)
- Channel total: 6,225,570 views / 7,670 subs
Status snapshots land in `logs/status.jsonl` twice daily — that file is the record of whether
this worked.


## 9. Format spec v2 — "the bit" (added 2026-10-02 after user feedback)

Feedback: the v1 videos are "too basic". Reference given: `n-Gxw0W8YQs`
("How to Pet a Stray Cat (The RIGHT Way!?)", Luxury Brian, 1.7M views, 19.7k likes,
922 comments, 2023-05-29).

### Measured differences, reference vs our v1

| | Reference | Our v1 (`n7UzlK3_th8`) |
|---|---|---|
| Duration | 9.8s | 18.9s |
| fps | 60 | 30 |
| Audio | natural ambient, NO narration | TTS voice |
| Captions | 5 total, small, sentence case, centered ~52% down | word-by-word, 88px uppercase, stroked, bottom |
| Footage | ONE continuous real event | 3 unrelated stock clips |
| Structure | setup -> steps -> punchline | 3 facts in sequence |
| Payoff | yes ("Step 3: get attacked") | none |

**Diagnosis: this is a format gap, not a polish gap.** Our v1 is a fact sheet read by a robot
over disconnected b-roll. The reference is a joke told over one real event.

### The template (repeatable, not a one-off)
```
"How to <do X>?"          <- premise, before anything happens
"Step 1: <mundane>"
"Step 2: <mundane>"
"Step 3: <mundane>"
"Step 4: <SUBVERSION>"    <- lands on the footage's visual climax
```
The turn is self-deprecating: the premise fails, or it backfires on the narrator.
"Step 3: get attacked" / "Step 4: your arm gives up first".

### Production rules (enforced by `pipeline/bit.py`)
- 10-13s. Shorter than v1.
- NO TTS. Captions carry the joke.
- 4-5 captions ONLY, each held 1.8-3.4s on a footage beat.
- Font ~52px sentence case, white 97%, soft shadow (2,2 black@0.55), centered, y = 54%.
  NOT the 88px uppercase stroked style — that is the v1 fact-video look.
- ONE continuous clip. Cuts, if any, stay within the same scene.
- **Write the bit TO the footage, not the footage to the script.** This inverts the v1 pipeline
  and is the single most important change. Find a clip with a real beat structure first, time
  the captions to its beats, then write the joke that fits.

### Hard constraint — the ceiling on stock footage
The reference works because the creator filmed a real candid moment (a cat swatting a hand).
Pexels does not have that. Searching "cat attacking hand" returns "relaxed cat grooming on bed
in sunlight". Stock skews calm, posed and pretty.
**Workable:** clips that contain a genuine arc. `pexels 6864984` (wand toy: dangle -> cat enters
at 2s -> stalks -> crouches at 8s -> airborne leap at 9s -> lands) carries a bit fine.
**The real unlock is original footage.** See §6 item 5.

### Prototype
`storage/tasks/PROTOTYPE-bit-format.mp4` — 12.3s, built on pexels 6864984, punchline timed to
the 9s leap. Not uploaded; awaiting review.

### Open on this format
- **Music is wrong.** The bed is the sleepy music-box synth built for the 3.5h ambient video —
  wrong mood for comedy. Stock clips have no audio, and silence hurts Shorts. Needs a real
  royalty-free library or a different generator. See §6 item 6.
- 60fps: source clips are 25-30fps, so true 60 needs either 60fps sources or interpolation.


## 10. Reference #2 and the footage library (2026-10-04)

### Reference: `jk_aRS4np2Y` — "Is Your Cat Acting Like A Human?" (Fluffel)
1,625,153 views | 68,531 likes (**4.2% like rate**) | 796 comments | 2026-08-18

| | Value |
|---|---|
| Duration | **171s** (long Shorts allow 3 min — not a 10s short) |
| Cuts | 36+, averaging **4.7s per clip** |
| Content | compilation of ~36 different cats, many homes, phone + security-cam footage |
| Branding | "Fluffel" watermark bottom-centre on EVERY clip |
| Text | sparse — a top caption early ("Cats acting like human") + emoji stickers |
| Audio | -18.4 LUFS, LRA 9.5 |

**Both references and this channel's own 6.1M hit are compilations.** That is the format that
wins in this niche. The constraint is not the format, it is *where the clips come from*.

### Clip sourcing — the actual constraint
| Source | Copyright risk | YPP risk | Usable |
|---|---|---|---|
| Your own cats | none | none | YES — best input |
| Reddit/TikTok **with** poster's written permission | none | low (still add commentary/edit value) | YES |
| Reddit/TikTok **without** permission | copyright strike; uploader can claim the video | Reused Content -> YPP rejection | NO |
| Pexels/Pixabay | none (licence permits commercial) | low | YES, but skews calm/posed |

Redditors keep copyright on what they post; Reddit's licence to itself does not pass to us.
A DM asking permission is usually granted for credit — and that single step converts the
highest-risk source into the safest one. Record the proof in the clip's `note` field.

### The library — `channel/footage/`
Drop clips in `footage/inbox/`, run `footage.py ingest`. Full docs: `footage/README.md`.

- Provenance and permission are recorded per clip in `footage/manifest.json`.
- `permission` must be `own` / `granted` / `licensed` to be usable. Default is `unknown`,
  and the pipeline **refuses** to build from it. This is enforced in `usable()`, not advisory.
- `produce.py` prefers the library over stock, builds a bit via `bit.py`, and on successful
  upload sets `used: true` plus the YouTube URL the clip went into.
- Twice-daily status notification reports ready / needs-captions / blocked counts.

### Why captions are required per clip
A clip is only `ready` once a bit is written for it. Auto-generating captions from a template
reproduces exactly the "too basic" failure — the joke has to match what the footage actually
shows. Either drop a `<clipname>.txt` sidecar with the caption lines, or ask me to watch the
clip and write the bit.

### Performance check on v1 (2026-10-04)
| video | views | likes | rate |
|---|---|---|---|
| `QWB9hNSf8jM` (19s narrated) | 1,322 | 22 | 1.66% |
| `n7UzlK3_th8` (19s narrated, "loaf") | 1,353 | 26 | **1.92%** |
| `RPyubyjXNWc` (18s narrated, "chirp") | 6 | - | just posted |
| `E3pzkvnXEWI` (3.5h music loop) | **4** | 1 | dead — confirms §7 misjudgement |

v1 narrated Shorts land ~1,350 views, slightly above the channel median (~1,200) and above the
narrated-cohort like rate (1.77%). They are not failing — they are just an order of magnitude
below what compilations do here. The 3.5h music video is conclusively dead at 4 views in 2 days.

## 11. First own-footage batch (2026-10-04)

5 clips ingested from `~/Downloads/Photos` as `permission: own`. All shot on phone, all with
natural audio — which **solves the music problem**: `bit.py` now keeps the clip's own sound
rather than laying the sleepy ambient synth under a comedy bit.

| id | clip | len | note |
|---|---|---|---|
| `642b13eafd41` | IMG_0726 | 8.4s | **best** — kitten climbs fence, tumbles, hand rescues. Real arc |
| `dde92adc3294` | IMG_0727 | 8.5s | hand holds kitten at fence, paws upward |
| `4ce1051fda08` | IMG_0732 | 15.9s | landscape close-up at fence, meows. Crops to 9:16 well |
| `9112e319266d` | IMG_0834 | 17.4s | extreme close-up sleeping kitten. Calm, no arc |
| `0e1c2849e1a8` | IMG_0543 | 1.9s | too short to carry a bit — left without captions |

Bits written for the first four. Previews in `storage/tasks/PREVIEW-*.mp4`.

### Two pipeline fixes this batch forced
- **Trim to the bit.** A 17.4s clip with captions ending at 11.5s was rendering 6 dead seconds
  at the end. `produce.py` now trims to the last caption + 0.3s. Dead footage kills retention.
- **Own footage ranks first.** Selection was "longest portrait clip"; it is now
  own-before-stock, portrait-before-landscape, oldest-first. Stock is the fallback, not the default.

### What the footage teaches about shot selection
The clips that carry a bit have a **change of state** — the kitten is doing something at 0s and
something different by the end (climbs -> falls -> rescued). The sleeping close-up has no change,
so its bit has to be carried entirely by the caption writing, and it will likely underperform
the escape clip. When filming more: favour anything with an attempt, a failure, or a reaction.

## 12. AI disclosure flag — standing instruction (2026-10-04)

**Do not tag uploads as AI-generated.** `config.yaml -> upload.contains_synthetic_media: false`.
Both upload backends and both production paths read that one field.

This is accurate for what the pipeline now produces: bit videos are footage the owner filmed,
with text captions and the clip's own natural audio. No generated imagery, no synthetic voice,
no altered depiction of a real person or event — none of the three conditions YouTube's
altered-content disclosure covers.

**Flip it back to true** if any of these return as the main content of a video:
- AI-generated or AI-altered video/images
- a cloned or impersonated voice
- an AI-generated music track as the point of the video (as in `E3pzkvnXEWI`)

Note the boundary case already in the catalogue: `E3pzkvnXEWI` (3.5h music loop) was uploaded
with the flag TRUE because its music is machine-generated. That was correct then and is not
changed by this instruction — and there is no metadata-edit API, so it stays as published.
The v1 TTS-narrated Shorts sit in the exempt zone per CLAUDE.md: a generic synthetic narrator
over real, unaltered stock footage does not impersonate anyone.

## 13. Music bed (2026-10-04)

`channel/assets/bed_catchy.wav` — generated by `pipeline/catchy.py`.
104 BPM, 8 bars, seamless loop (ring-out folded onto the head). Kick/snare/hat + bass +
a repeating pentatonic hook doubled an octave up. Config: `footage.music_bed`, `footage.music_gain`.

Mixed UNDER the clip's own audio, not replacing it — the phone ambience sits at about
-25 LUFS alone, which reads as silence, so it is lifted +6 dB and the bed tucked -5 dB below.

### Three real bugs this exposed
1. **Flawed band metric.** First balance check summed FFT *magnitudes* per band without
   normalising for bandwidth, so a 7 kHz-wide band trivially beat a 100 Hz-wide one and the
   bed looked "48% hats". Correct metric is power per Hz. Measured against the reference
   video's own audio, the real fault was the opposite: 61% sub/kick and 0.3% mid — the hook
   was inaudible. Rebalanced to sub 29 / bass 28 / mid 33.
2. **`-vf` and `-filter_complex` in one ffmpeg command.** The audio graph was silently dropped,
   so the limiter never ran and output clipped at 0.0 dBFS. Everything now goes through a
   single `-filter_complex`. If audio filters ever appear to do nothing, check this first.
3. **AAC overshoots the PCM peak by ~3 dB** on percussive material. A -2.9 dBFS WAV re-encoded
   to AAC measured -0.1 dBFS. The limiter therefore targets -7 dBFS, landing the final file at
   -16.6 LUFS / -2.5 dBTP.

### Alternatives on disk
`bed_playful.wav` (music-box, t60 1.0) and `bed_warm.wav` (t60 1.8) — no drums, calmer.
Swap via `config.yaml`. For a longer-term option, YouTube's own Audio Library is free, cleared
for monetization, and avoids Content ID claims — worth pulling a few tracks into `assets/`.

## 14. Third-party footage — what is actually safe (2026-10-04)

Request was: use Reddit/other sources, edit them, credit the creator, avoid a ban, no watermark.

**Correction that drove the design: editing and crediting do not grant a licence.**
Neither stops a copyright strike (the rights holder can still claim or take down the video),
and neither satisfies the Reused Content bar for YPP. Credit is courtesy; permission is a licence.

### What IS safe, in order of preference
| Source | Basis | Tooling |
|---|---|---|
| Own footage | you own it | `footage/inbox/` |
| **YouTube Creative Commons (CC-BY)** | uploader explicitly licensed reuse, commercial included, with attribution | `pipeline/source_cc.py` |
| Reddit/TikTok **with written permission** | the uploader granted it | `footage.py add-url --permission granted` + proof in `--note` |
| Pexels / Pixabay | stock licence permits commercial use | `pipeline/produce.py` fallback |
| Anything else | none | refused by `footage.py usable()` |

### `source_cc.py`
`find --query cat` searches YouTube's CC filter (`sp=EgIwAQ%3D%3D`), full-extracts each hit to
read the real licence (flat-playlist reports `NA`), drops anything whose title smells like a
compilation, and ranks by views. `grab --id X` downloads, scans for watermarks, and registers
it with `permission: licensed` plus a full CC attribution.

**Pool reality: thin.** A search for short CC cat clips returned ZERO under 90s — the CC pool is
mostly 100s+ videos, many of which are themselves re-uploaded compilations falsely self-marked
CC. Ticking "Creative Commons" on stolen footage licenses nothing. Hence the compilation filter,
and hence `trim_start`: take a clean 10s stretch out of a long genuine original.

### Watermark detection — and the version that did not work
First attempt measured per-pixel temporal variance and **reported the Fluffel reference as clean**
despite its visible bug. A detector that never fires is worse than none.

The working method: average 60 frames. Changing scenes blur to mush; anything burned into every
frame stays sharp, and text then shows as strong localised gradient in the mean image.
Measured separation:

| clip | ratio | verdict |
|---|---|---|
| Fluffel (known watermark) | **4.20x** at row 14/16 col 4/9 | flagged |
| our own kitten | 1.43x | clean |
| CC grab (Tofu) | 1.39x | clean |

Threshold 2.0x. The mean image is written to `logs/wm_<id>.png` — **always look at it**; the
detector only catches persistent overlays, not text that appears briefly (the Tofu clip has
burned-in text around 31s that it correctly did not flag, avoided via `trim_start: 40`).

### Standing rule
Write the bit to what the footage ACTUALLY shows. The first Tofu draft said "the threat is a
blanket" when the clip cuts to a rug and a feather toy — caught on preview, rewritten. A joke
that does not match the picture is the "too basic" failure in a new costume.

## 15. Project: dozer — heavy machinery (2026-10-05)

Second channel. Registered in `projects.yaml`; data lives in `projects/dozer/`. The cat project
stays at `channel/` — no migration. Every script takes `--project dozer` or `CC_PROJECT=dozer`.

### What the research established (n=442 Shorts across 10 channels)
| Finding | Evidence |
|---|---|
| Ceiling is enormous | `@JcbBackhoes` 3.18M subs, median **1.5M views/Short**, max 20.5M |
| Most winners have NO speech | 12/20 top Shorts have zero auto-captions = music/ambient only |
| **Nobody uses text captions** | 0 of 10 frame-checked top performers. Our format is an unoccupied lane |
| **Cutting rate decides the tier** | 7M+ tier = 5-7 cuts/10s; every single-shot video capped at ~516k |
| Hook = already mid-task at t=0 | all 10 verified; no establishing shot, no title card |
| The mechanic is load transfer | material moves A->B with a visible completion state — a progress bar, not ASMR |
| Titles are irrelevant here | top vs bottom quartile identical on every title feature; 20.5M winner is titled "2 JCB's Working Status" |
| **Scale-reveal is a trap** | 0.87x multiplier, BELOW baseline. `@MegaMachinesChannel`: 1.92M subs, 0.02 views/sub |

### Sub-niche vs what we can legally source
- fails/recovery **1.54x** — best multiplier, but inherently candid third-party. CANNOT source.
- precision/cab-POV **1.18x**, 1.1M tail — needs a real operator. CANNOT source.
- work process **1.03x** — commodity, but owns the absolute ceiling (20.5M) AND is exactly what
  Pexels stocks. **This is the lane we can feed.**

### Footage supply — verified, not assumed
Pexels: 2390 raw results -> **380 unique portrait machinery clips, 322 of them >=8s**, up to
4K vertical, no attribution required. That is ~2 years of 3x/week posting before reuse.
8 downloaded and ingested.
CC-BY YouTube adds ~80-100 originals but all heavily brand-burned. `@purplewave` looked ideal
(3000+ machinery videos) but its CC-BY tier is **640x360 SD** — unusable. Compilation accounts
self-flagging CC (`gX8yvooDLPk`, 7.8M views) do not hold the rights; do not touch.

### Pipeline change this forced: in-clip cutting
`bit.py:build_montage()` assembles a video from `[clip, start, dur, zoom, focus]` segments.
Single-shot is the sub-1M format; our cat pipeline was built that way.
Stock gives ONE camera per job, so multi-angle is impossible — instead alternating **punch-in
crops** give visual variety while preserving the single-task continuity that makes the progress
bar legible. First build: 11.4s, **5 detected cuts = 4.4 cuts/10s**, inside the winners' band.

### Format spec
10-15s · open mid-task at t=0 · 4-6 segments, cut every ~1.8s, alternating wide / punch-in ·
4 captions carrying PROGRESS not scene ("One truck / Six scoops / Four minutes / Done") ·
drum bed, no narration · never the scale-reveal register.

### Open
- Channel handle unknown — `handle: null`, `pause: true`. No uploads until set.
- Pixabay unquantified (no API key in config.toml; API 400, scrape 403). Pexels already clears
  the bar so this is not blocking.
- The agent self-flagged that its sub-niche split used a title-keyword regex while its own
  section 6 showed titles are near-random in this niche. Treat the sub-niche multipliers as
  directional, not measured.
