# Type scale — thecatcourt Film 01

Measured against a 848px content column inside `SAFE` (src/reel/stage.ts), 1080x1920.
Verified on the 360px readability strip across two critique rounds.

**Read the "Use" column, not the "Floor" column.** The floor is where legibility *fails*; building
at the floor ships a strip that fails review. Round 1 was scored 5/10 on readability precisely
because the floors were treated as targets.

| Role | Face | **Use** | Floor | Notes |
|---|---|---|---|---|
| Verdict (biggest in film) | Fraunces 900 | 470 / 250 | — | Deliberately cropped by frame edges |
| Hook fragments | Fraunces 900 | 150-190 | — | `IT` / `DID NOT` / `FALL` |
| Display headline / claim | Fraunces 700 | 60-68 | 56 | Long claims take the low end |
| Case header | Fraunces 600 | 60-64 | 56 | `THE STATE v. THE CAT` |
| Label | Inter 600 | **44** | 38 | `EXHIBIT A`, `COUNT ONE`, docket. 38 fails the strip |
| Body / detail | Inter 400-500 | **38** | 32 | Detail lines under claims. 32 fails the strip |
| Small readout | Inter 500 | 32-34 | 28 | Sweep readouts, axis labels |
| Counter numeral | Fraunces 900 | 220 | — | `25 CM` |

## Vertical budget
`SAFE` is y=180 to y=1500 — a **1320px band, centred on y=840**. Target **80%+ of that band used**.
Round 1 failed Composition at 4/10 because every act independently anchored to the top and left
400-640px of dead black beneath. Measured after the round-1 fix: ExhibitA 93%, ExhibitB 79%,
ExhibitC 94%.

## Rules learned the hard way
- **A 21-char display line at 68px overflows an 848px column.** `CATS PREDICT THE DROP` wrapped onto
  its detail line. Budget display type by measured width, not character count — the 22-char
  readability ceiling is about legibility at 360px, NOT about fitting the column. If it does not
  fit, enlarge the container; do not shrink the type.
- Anything inside `overflow: hidden` needs its own margin budget. Five station words on a 150px
  track clipped; 190px cleared them, and 40px words need 168px pitch.
- A claim band must lead its own text by ~6 frames, or the text appears to arrive before its
  background.
- Clamp a readout that travels, and check it at BOTH ends of its travel.
- Gate decorative elements to the beat that introduces them. A dashed axis rendering from the act's
  first frame put a stray hairline across two otherwise-empty beats.
- **A heavy blur on a near-white fill reads as a banned glow orb at 360px.** Keep the silhouette
  recognisable at every blur level.

## Voice calibration (TTS)
**Gemini `Sulafat` speaks at ~1.5 words/sec** including its natural pauses — measured over 7
rendered lines, not assumed. Budgeting narration at a guessed 2.6 w/s produced a script 111% of
runtime and cost a full TTS pass. A 3.2s window takes ~4 words; a 6.4s window takes ~8.
Target ~70% fill, not 100% — the beat hits need air.
**Process fix: voice one short line and measure it before writing the rest of the script.**

Better model, fitted to 7 measured Sulafat lines (4-13 words):
`duration = 1.22s + 0.464s/word`  — i.e. a ~1.2s fixed lead-in plus a **marginal 2.16 words/sec**.
The flat 1.5 w/s rate is conservative (it overestimates, which is safe) but systematically
overstates speech share because it charges the lead-in to every word. Use the two-term model
when fitting narration into tight windows; use the flat rate when you want a safety margin.
