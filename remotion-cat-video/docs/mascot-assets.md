# Rizz mascot — asset spec

TL;DR: **7 images**, same pose, only the mouth differs. Corner-anchored, mirrored in
code for the opposite corner. Lip sync driven by Rhubarb viseme cues over the clean
wav we already generate. Verified against `src/rizz/components.tsx` @ 2026-10-24.

## Why full images instead of a mouth sprite layer

The textbook approach is one base body with a blank mouth plus a registered sprite
sheet of mouth shapes. Image generators cannot hold sub-pixel registration across
separate generations, so that approach needs hand-cutting in an editor.

Swapping the **whole character image** per viseme sidesteps registration entirely —
the only requirement becomes "same pose", which a reference-image edit can hold.
Costs ~6x the file size (about 2 MB total), which is irrelevant here.

## The list

| # | File | What differs | Required |
|---|---|---|---|
| 1 | `rizz-X.png` | Mouth closed, neutral — the rest/idle pose | yes |
| 2 | `rizz-A.png` | Lips pressed shut (P, B, M) | yes |
| 3 | `rizz-B.png` | Slightly open, teeth nearly together (EE, most consonants) | yes |
| 4 | `rizz-C.png` | Open oval, relaxed (EH, AE) | yes |
| 5 | `rizz-D.png` | Wide open, tongue visible (AA — "cat", "lands") | yes |
| 6 | `rizz-E.png` | Rounded, moderately open (AO, ER — "paw", "word") | yes |
| 7 | `rizz-F.png` | Small tight pucker (OO, W — "you", "two") | yes |
| 8 | `rizz-blink.png` | Pose #1 with both eyes closed | strongly recommended |
| 9 | `rizz-brow.png` | Pose #1 with brows raised | optional, for emphasis beats |

Shapes X/A–F are the [Rhubarb Lip Sync](https://github.com/DanielSWolf/rhubarb-lip-sync)
basic set. G (upper teeth on lower lip, for F/V) is omitted deliberately — cats have no
human lip, so it reads wrong. H (L) folds into C.

## Hard requirements — every file

| Spec | Value | Why |
|---|---|---|
| Format | PNG, RGBA, true alpha | Composited over `#14100d` |
| Canvas | **Identical** W×H across all 9 | Swapping must not shift the character a single pixel |
| Pose registration | Head, body, paws, bow tie pixel-identical across all 9 | Only the mouth (or eyes) may differ, else it reads as a jump cut |
| Size | ≥1000px tall | Renders at ~520px; 2x for crisp edges |
| Crop | Tight to subject, no padding | Render sizes the canvas, not the cat |
| Facing | 3/4 turn to the **right**, head angled toward frame centre | Mirrored in code via `scaleX(-1)` for the left corner |
| Framing | Head + torso + front paws, cut at mid-thigh | Corner mascot; full body wastes the frame |
| Edge | No light fringe on semi-transparent pixels | Glows against near-black |
| Shadow | None baked in | The image bobs and squashes |
| Lighting | Same key direction in all 9 | Flicker on swap otherwise |

## Placement

Bottom corner, chosen by what else is on screen:

| Composition | Corner | Reason |
|---|---|---|
| `Rizz` | either | Nothing else competing |
| `RizzExplainer` | bottom-**right** | Step strip is left-aligned |

One asset set covers both corners: Rizz is bilaterally symmetric (centred bow tie, no
text, no asymmetric marking), so `transform: scaleX(-1)` is a valid mirror. Mirror the
mouth anchor X with it.

## Mouth anchor

The speech-bubble tail points at the mouth. Measure it once per asset set rather than
guessing — in the current front-facing art the mouth interior sits at y 180–202 of a
542px canvas (≈0.35 of height). Re-measure after the new pose lands; the 3/4 turn moves
it off centre horizontally.

## Lip sync pipeline (once assets land)

`rhubarb -f json -r phonetic --dialogFile <text> <slug>.clean.wav` → cue list of
`{time, value: "A".."X"}`. We already produce exactly the two inputs it wants. The cue
list drops next to `captions.<slug>.json` and the component picks the image whose cue
window contains the current frame.

Blinks are not in the cue list — drive them off a fixed cadence (one every 3–5s, 4 frames
closed) so they do not land on the same frame every loop.
