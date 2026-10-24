# Director's brief — thecatcourt, Film 01

## The film in one line
A cat is put on trial for the one crime every cat commits, and the court acquits it on the
evidence — because the science is on the cat's side.

That logline is the check for every decision. If a shot doesn't serve "trial → evidence →
acquittal", it is cut.

## Format
- 1080x1920 (9:16), 60 fps, 22.0s, 120 BPM — **11 bars, 44 beats, 1320 frames**.
- No voiceover. Score + UI/foley SFX synthesised in code. Kinetic type carries the message.
- Must loop: frame 1319 reads as frame 0.

## Brand
- Studio: **thecatcourt**. Judicial, dry, confident. Not cute, not meme, no emoji.
- Palette is already the brand and does not change: bg `#14100d`, panel `#1d1712`,
  accent `#e3a856` (gold), text `#f5efe6`, muted `#b8ada0`. **Gold is the only accent.**
- Display face Fraunces (verdicts, headlines). UI face Inter (labels, docket numbers, evidence).
- Visual grammar: a court record. Case headers, docket numbers, exhibit labels, stamps,
  redaction bars, a gavel. All drawn as SVG/CSS — never a photo, never a stock icon, never an emoji.

## Beat sheet (bars are 2.0s each; every beat must carry a change)
| Bar | Time | Act | What the viewer sees |
|---|---|---|---|
| 0 | 0.0-2.0 | **HOOK** | Cold open on the crime itself, in huge kinetic type. No logo, no intro card. The single most striking image of the film lives in the first 2 seconds. |
| 1-2 | 2.0-6.0 | **THE CHARGE** | The case file assembles — one container morphing, docket number, the charge typed out, defendant identified. |
| 3-5 | 6.0-12.0 | **EVIDENCE** | Three exhibits, one per bar. Each is a distinct visual mechanism, not three copies of a layout. Each reveals a real, checkable fact about cat behaviour. |
| 6-7 | 12.0-16.0 | **DELIBERATION** | Tension drop. One number that settles it, counting up, landing on a beat. |
| 8-9 | 16.0-20.0 | **VERDICT** | The verdict slams. Biggest type in the film. Stamp lands on a downbeat. |
| 10 | 20.0-22.0 | **LOCKUP** | thecatcourt lockup + a line that sets up the next case. Final frame resolves into the opening frame. |

## Hard rules
- `docs/motion-rules.md` is binding. The banned-defaults list is an automatic fail.
- Every claim on screen must be true and checkable. This is a facts channel; a wrong fact is a
  worse failure than an ugly frame.
- Real mechanism over decoration: if a shot is just text moving, it is not an exhibit yet.
- No static holds. If a beat has nothing happening, the beat is wrong — cut it or give it work.

## Workflow gates — do not skip
plan → beat grid → shotlist (approved) → motion lib → scenes → stills → contact sheet →
critique loop (every axis 8+) → sound → full render → loop check.

## Deliverables
`out/thecatcourt-01.mp4`, `out/contact.png`, `out/poster.png`, `docs/shotlist.md`,
`docs/review_log.md`.

## Provenance
Method adapted from Lukas Margerie, "How to Make Insane Motion Graphics With Opus 5.5"
(youtube.com/watch?v=747ZnEtsRbg, 2026-09-29). Studied 2026-10-04.
