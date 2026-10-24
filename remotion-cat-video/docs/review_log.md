# Critique loop — thecatcourt Film 01

Gate: **every axis 8+** before a full render happens. Per `docs/motion-rules.md`.
Procedure each round: `scripts/contact-sheet.sh TheCatCourt01 <round>` → look at the sheet →
score → write the 3 worst problems → fix → re-score.

## Axes
| Axis | What it measures | Fails if |
|---|---|---|
| Hook | Does the first 2s stop a thumb | Nothing striking before beat 4 |
| Readability @360 | Legible at phone size | Any headline unreadable on the 360px strip |
| Motion | Spring quality, no dead time | A beat with no change; bouncy/elastic easing |
| Variety | Each act has its own mechanism | Two acts share a layout |
| Composition | Framing, safe areas, balance | Text in the YouTube UI zones |
| Brand | thecatcourt register and palette | Off-palette colour; cute/meme tone; 2nd accent |
| Sound sync | Picture lands on the grid | A slam or stamp off its beat |

## Rounds
_(filled in as the loop runs)_

### Round 1 — 2026-10-04
Contact sheet: `out/review/round-1/contact.png` · readability: `readability-360.png`

| Axis | Score | Evidence |
|---|---|---|
| Hook | 5 | Type (`IT`/`DID NOT`/`FALL`) lands well, but the mug + paw are tiny in a thin band and read as debris. Beat 4's fragment collapse blows out into large white blobs over the type — the film's most important seam currently reads as a glitch. |
| Readability @360 | 5 | Display headlines pass. Everything secondary fails: docket line, `OF ONE CERAMIC MUG`, exhibit detail lines, and the five Exhibit-B station words are all illegible on the 360px strip. |
| Motion | 7 | Springs settle correctly, no bouncy easing, no dead beats observed. |
| Variety | 9 | The three exhibits genuinely share no layout, axis or reveal. Acts are distinct. |
| **Composition** | **4** | **Worst axis.** Content sits in the top ~55% of frame across nearly every act; the bottom 400-640px is empty black. Deliberation is additionally left-weighted (measure at x~210, number at x~430, right third empty). |
| Brand | 7 | Palette is clean and gold-only. But two looks break the register: the blurred mug reads as a **glow orb** at phone size (glow is banned), and the verdict stamp ring + ink bleed read as **scribbled ellipses crossing the type** rather than a stamp. |
| Sound sync | 8 | Hits verified on-grid numerically; picture keyed to the same `sfx.ts` beats. |

**Three worst problems, in fix order**
1. **Composition (4)** — dead bottom third throughout. Content must use the full safe band (y 180-1500, centre 840), not hug the top.
2. **Readability (5)** — all secondary type is below phone-legible size. Per `docs/type-scale.md`, labels want 38px and body 32px minimum; much of it is well under.
3. **Hook (5)** — mug/paw too small to read as a mug being pushed; beat-4 fragment collapse blows out to white blobs.

Also logged, not in the top 3: blur-as-glow (Brand), stamp-as-scribble (Brand).

### Round 2 — 2026-10-04
Contact sheet: `out/review/round-2/contact.png` · readability: `readability-360.png`

| Axis | R1 | R2 | Evidence |
|---|---|---|---|
| Hook | 5 | **8** | Mug now unmistakably a mug at 360px — tapered body + open handle overhanging the lip. Beat-4 shards read as seven ceramic pieces, not white blobs. Root cause found: `STAGE.mugSize` is the glyph BOX; `MUG_BODY` fills only 90/200 viewBox units, so the drawn mug was 117px. |
| Readability @360 | 5 | **8** | All five previously-illegible charge lines now read. Station words POKE/BAT/SCOOP/POUNCE/GRASP legible. `NEAR POINT · 4 CATS`, `ANY CLOSER IS BLUR`, `CHARGE DISMISSED` all pass. One cause was colour, not size: `textMuted` on `panel` is too low-contrast. |
| Motion | 7 | **8** | No dead beats. Shard travel/scale springs now staggered so they land as tiles rather than inflating mid-flight. |
| Variety | 9 | **9** | Unchanged. |
| Composition | 4 | **7** | Big improvement — safe-band usage measured 79-94% (was ~55% with 400-640px dead). Remaining: beats 12, 16-17, 20-21, 24-25 cluster content in one region with large voids. Transitional, not static, but they read under-filled on the sheet. |
| **Brand** | 7 | **6** | **Regressed and now the worst axis.** The stamp is two concentric tilted ellipses that read as a hand-drawn pen loop lassoing the words, not a judicial stamp — and it crosses `GUILTY` through the middle, damaging the film's most important line. Gating it to beat 35 removed the stray-arc problem; the ring's *design* is the remaining fault. Glow orb is fixed (blur capped 10px + fill lerp to `textMuted`). |
| Sound sync | 8 | **8** | Unchanged, verified numerically. |

**Below gate: Brand (6), Composition (7).** Everything else is 8+.

**Fixes for round 3**
1. **Brand** — redesign the stamp impression. It must not bisect the verdict type.
2. **Composition** — targeted fill/rebalance on the four sparsest beats.

### Round 3-4 — 2026-10-04 (final)

**Stamp redesigned.** Root cause was geometric, not stylistic: the ring was centred at y=855,
exactly midway between `NOT` (700) and `GUILTY` (1010), so it bisected both words by construction.
Replaced the concentric ellipses with a single offset impression at (888, 540), Ø395, landing at
-11°, with an uneven `strokeDasharray` standing in for ink take-up (a rubber stamp never lays a
continuous line). `GUILTY` is now completely clear; it reads as pressed, not drawn.

**Beat 24 defect caught at full res that the 360px strip hid.** The three exhibits mid-shrink were
300px gold slabs scattered asymmetrically, the third spanning x 820→1120 — clipped by the 1080
frame edge and colliding with the counter. At 360px they read as innocuous gold dashes. Re-laid as
a row of 170px boxes at y=420, all inside frame and clear of the counter column.
*Lesson: the 360px strip is necessary but not sufficient. A mid-transition frame can hide a
clipping bug at review scale. Spot-check transitional beats at full resolution.*

| Axis | R1 | R2 | **R4** |
|---|---|---|---|
| Hook | 5 | 8 | **8** |
| Readability @360 | 5 | 8 | **8** |
| Motion | 7 | 8 | **8** |
| Variety | 9 | 9 | **9** |
| Composition | 4 | 7 | **8** |
| Brand | 7 | 6 | **8** |
| Sound sync | 8 | 8 | **8** |

**Every axis 8+. Gate passed — cleared for full render.**

### Known limitations (carried to Film 02, not defects)
- Beats 12, 16-17, 20-21 are transitional and read sparse next to their neighbours. Each carries a
  real change, and the exhibit builder demonstrated a hard constraint: `BAR.cy` is at 830 by
  necessity, and pushing Exhibit B's track lower drives Exhibit C's landing past y1500 into the
  Shorts overlay. Accepted rather than forced.
- `COUNT ONE` renders at ~23px after the beat-10 shrink, below the 38px label floor. It is a
  de-emphasised header at that point and is full size during its own beats 7-9.
