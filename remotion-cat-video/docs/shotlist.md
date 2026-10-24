# Shotlist — thecatcourt, Film 01: *The State v. The Cat*

**Grid:** 120 BPM / 60 fps. 1 beat = 30 frames = 0.5s. 1 bar = 4 beats = 120 frames = 2.0s.
11 bars = 44 beats = 1320 frames = 22.0s. Beat `n` starts at frame `30n`. Bar `B` starts at beat `4B`.

---

## 1. Logline check

A cat is tried for deliberately pushing a mug off a table, and the court acquits it because
every piece of behavioural evidence says the paw was an instrument of inspection, not of malice.

**The joke (the dry turn):** the film is built like a prosecution and every exhibit it enters
turns out to be for the defence — the crime is real, the intent is not. Any shot that makes the
cat look guilty, cute, or incidental fails this check.

---

## 2. The copy — final

### 2.1 Hook (bar 0, beats 0-3) — 5 words max

Six candidates:

| # | Hook | Words | Chars | Why it might win |
|---|---|---|---|---|
| 1 | IT DID NOT FALL | 4 | 15 | Names a crime and a culprit without naming either. Pure deadpan. |
| 2 | THE CAT PUSHED IT | 4 | 17 | Clear, but spends the reveal immediately and reads as a caption. |
| 3 | GRAVITY IS NOT TO BLAME | 5 | 23 | Good register, 1 char over the readable limit, and slightly arch. |
| 4 | ONE MUG. ONE SUSPECT. | 4 | 21 | Nicely judicial, but two clauses dilute the slam. |
| 5 | THE STATE v. THE CAT | 5 | 20 | Strong as a case header; weak as a hook — it's an intro card. |
| 6 | THIS WAS NOT AN ACCIDENT | 5 | 24 | Over the limit, and "accident" is a soft word. |

**Picked: #1 — `IT DID NOT FALL`.** It is the only candidate that is simultaneously a verdict, an
accusation and a question, it needs zero prior context to land over a mug going over an edge, and
at 15 characters it survives 360px as three slammed fragments.

Rendered as three slams, one per beat: **`IT`** / **`DID NOT`** / **`FALL`** — the word `FALL`
lands on the frame the mug lands.

### 2.2 The charge (bars 1-2, beats 4-11)

| Slot | Copy | Chars | Face |
|---|---|---|---|
| Case header | `THE STATE v. THE CAT` | 20 | Fraunces |
| Docket | `DOCKET No. 01-CAT` | 17 | Inter |
| Count heading | `COUNT ONE` | 9 | Inter |
| Charge line 1 | `WILFUL DISPLACEMENT` | 19 | Fraunces |
| Charge line 2 | `OF ONE CERAMIC MUG` | 18 | Fraunces |
| Defendant | `DEFENDANT: FELIS CATUS` | 22 | Inter |

> `DEFENDANT: FELIS CATUS` is exactly at the 22-char ceiling. It is set in the UI face at label
> scale, not display scale, so it clears 360px — but it is the one line to check first on the strip.

### 2.3 The three exhibits (bars 3-5, beats 12-23)

| Label | Claim (≤6 words) | Chars | Detail line (≤10 words) | Words |
|---|---|---|---|---|
| `EXHIBIT A` | `THE PAW IS A SENSOR` | 19 | Pad receptors sharpen as vibration speeds up. | 7 |
| `EXHIBIT B` | `BATTING IS HUNTING` | 18 | Object play repeats poke, bat, scoop, pounce, grasp. | 8 |
| `EXHIBIT C` | `CATS PREDICT THE DROP` | 21 | A rattle makes a cat expect something to fall. | 9 |

### 2.4 The decisive number (bars 6-7, beats 24-31)

**`25`** counting up from 0, landing hard on beat 28, then opening to the full measured range on
beat 29.

| Slot | Copy | Chars |
|---|---|---|
| Counter lands | `25 CM` | 5 |
| Range completes | `25-36 CM` | 8 |
| Label | `NEAR POINT · 4 CATS` | 19 |
| Consequence | `ANY CLOSER IS BLUR` | 18 |

**What it counts:** centimetres. It is the near point of accommodation in the domestic cat — the
closest distance at which a cat's eye can still bring a target into focus. Measured in four cats
at 25 to 36 cm (Bloom & Berkley 1977). A mug at the edge of a table that the cat is standing on is
inside that distance. The cat cannot see it clearly. The paw is the only instrument left.

### 2.5 Verdict (bars 8-9, beats 32-39)

**`NOT`** / **`GUILTY`** — two lines, 3 and 6 characters, the largest type in the film, overscale
and cropped by the frame edges.

Follow-through copy: `CHARGE DISMISSED` (16 chars).

### 2.6 Lockup (bar 10, beats 40-43)

```
thecatcourt
CASE 02
THE 4 A.M. SPRINT
```

`thecatcourt` (11) / `CASE 02` (7) / `THE 4 A.M. SPRINT` (17). The next-case line is a tease, not a
claim — nothing factual is asserted about it in this film.

---

## 3. Beat table — all 44 beats

Every row carries a change. No row is a hold.

| Beat | Frame | Bar | Act | On screen (copy) | Visual event | SFX |
|---|---|---|---|---|---|---|
| 0 | 0 | 0 | HOOK | — | Mug at rest on a table edge, frame-left. A gold paw silhouette enters frame-right and makes contact; mug leaves the edge. | thump |
| 1 | 30 | 0 | HOOK | `IT` | `IT` slams in overscale. Mug begins its fall; a hairline trajectory arc starts drawing behind it. | slam |
| 2 | 60 | 0 | HOOK | `IT DID NOT` | `DID NOT` slams below. Arc extends; mug rotates ~90°. | slam |
| 3 | 90 | 0 | HOOK | `IT DID NOT FALL` | `FALL` slams on the frame the mug meets the bottom edge; it breaks into 7 fragments; the whole type block jolts 2px. | slam |
| 4 | 120 | 1 | CHARGE | — | The 7 fragments magnetise and collapse inward, forming one panel rectangle that grows over and wipes the hook type. | whoosh |
| 5 | 150 | 1 | CHARGE | `THE STATE v. THE CAT` | Panel settles to final size and radius. Case header mask-reveals top-down inside it. | click |
| 6 | 180 | 1 | CHARGE | + `DOCKET No. 01-CAT` | A gold hairline rule draws left-to-right under the header; the docket digits scrub into place above it. | tick |
| 7 | 210 | 1 | CHARGE | + `COUNT ONE` | A solid redaction bar sweeps across a blank line, then retracts to the right, leaving `COUNT ONE` behind it. | whoosh |
| 8 | 240 | 2 | CHARGE | + `WILFUL DISPLACEMENT` | Charge line 1 arrives per-word, 6-frame stagger. | tick |
| 9 | 270 | 2 | CHARGE | + `OF ONE CERAMIC MUG` | Charge line 2 slams as one block; the panel flexes 1% and recovers. | thump |
| 10 | 300 | 2 | CHARGE | (charge text shrinks to a header) | Panel splits on a horizontal seam; the lower half slides down to open a defendant slot; a line-drawn cat-head glyph scales into it. | click |
| 11 | 330 | 2 | CHARGE | + `DEFENDANT: FELIS CATUS` | Label mask-reveals under the glyph. A gavel silhouette rises into frame-right, cocked. | stamp |
| 12 | 360 | 3 | EXHIBIT A | `EXHIBIT A` | Gavel strikes. Whole frame jolts for 1 frame. Panel contracts into a square exhibit card; the label ticks in. | slam |
| 13 | 390 | 3 | EXHIBIT A | `EXHIBIT A` | A forepaw underside draws itself by stroke-dash reveal — outline first, then five pad shapes. | whoosh |
| 14 | 420 | 3 | EXHIBIT A | `20 Hz → 400 Hz` | Receptor dots pepper into the pads and begin pulsing. A frequency scale sweeps along the card's base; the dots pulse faster and brighter as the sweep rises. | riser |
| 15 | 450 | 3 | EXHIBIT A | `THE PAW IS A SENSOR` + detail | Sweep hits 400 Hz and stops. Claim slams over the paw; detail line mask-reveals beneath. | slam |
| 16 | 480 | 4 | EXHIBIT B | `EXHIBIT B` | Exhibit card rotates about its horizontal axis and flattens into a left-to-right track; the label flips from A to B on the same rotation. | click |
| 17 | 510 | 4 | EXHIBIT B | `POKE BAT SCOOP POUNCE GRASP` | Five station ticks snap onto the track and stamp their words, one per 6 frames. | tick |
| 18 | 540 | 4 | EXHIBIT B | (stations light in turn) | A paw glyph travels the track left to right; at each station the tick flares gold and a short motion arc draws out of it. | thump |
| 19 | 570 | 4 | EXHIBIT B | `BATTING IS HUNTING` + detail | Track compresses toward centre into a single bar. Claim slams; detail line reveals. | slam |
| 20 | 600 | 5 | EXHIBIT C | `EXHIBIT C` | The compressed bar extrudes upward into an opaque box with a lid seam. Label ticks over. | click |
| 21 | 630 | 5 | EXHIBIT C | — | Box shakes on the off-eighths; three gold sound arcs pulse outward on each shake. | tick |
| 22 | 660 | 5 | EXHIBIT C | (dashed predicted path) | Box rotates 180° about its base. A dashed arc draws ahead of the object, then the object drops out along it. | drop |
| 23 | 690 | 5 | EXHIBIT C | `CATS PREDICT THE DROP` + detail | Object lands on the predicted endpoint; the dash solidifies to a hairline. Claim slams; detail reveals. | slam |
| 24 | 720 | 6 | DELIBERATION | — | All three exhibits shrink to three small gold ticks in a row. Panel fill drops to background. Score drops out. | drop |
| 25 | 750 | 6 | DELIBERATION | — | A single vertical measuring line draws from the top of frame. A cat-eye glyph pins to its top, the mug glyph to its bottom. | whoosh |
| 26 | 780 | 6 | DELIBERATION | `0` → rising | Counter starts scrubbing upward. The mug glyph slides down the measure away from the eye, rendered blurred, sharpening as the number climbs. | tick |
| 27 | 810 | 6 | DELIBERATION | ~`18` | Measure ticks snap in at every 5. Mug still visibly soft. | tick |
| 28 | 840 | 7 | DELIBERATION | `25 CM` | Counter hard-stops on 25 with a 2-frame overshoot. The mug glyph snaps fully sharp on exactly this frame. | stamp |
| 29 | 870 | 7 | DELIBERATION | `25-36 CM` + `NEAR POINT · 4 CATS` | A bracket draws from 25 out to 36; the numeral opens to the range. Label mask-reveals under it. | click |
| 30 | 900 | 7 | DELIBERATION | + `ANY CLOSER IS BLUR` | The zone inside 25 cm fills with a gold hatch. The mug glyph slides back into the hatch and goes soft again. Caption types in. | whoosh |
| 31 | 930 | 7 | DELIBERATION | (glyphs only) | The Exhibit-A paw glyph slides into the hatched zone; the eye glyph closes. Riser builds under it. | riser |
| 32 | 960 | 8 | VERDICT | — | Everything clears on one upward wipe. Empty panel at full frame size, held open by the riser's resolution. | whoosh |
| 33 | 990 | 8 | VERDICT | `NOT` | `NOT` slams in at the largest scale in the film, cropped by both frame edges. | slam |
| 34 | 1020 | 8 | VERDICT | `NOT GUILTY` | `GUILTY` slams beneath it; the two words settle into one block with a 2-frame overshoot. | slam |
| 35 | 1050 | 8 | VERDICT | `NOT GUILTY` + stamp | A gold stamp ring rotates in at 8° and lands over the type. Type recoils 1 frame. Ink bleed draws outward from the ring. | stamp |
| 36 | 1080 | 9 | VERDICT | + `WILFUL DISPLACEMENT` (small) | The charge line reappears small above the verdict and a gold rule draws straight through it. | tick |
| 37 | 1110 | 9 | VERDICT | + `CHARGE DISMISSED` | Types on one line beneath the verdict block. | click |
| 38 | 1140 | 9 | VERDICT | (three ticks) | The three exhibit ticks re-enter along the bottom and each flips to a struck-through rule, left to right, 8 frames apart. | tick |
| 39 | 1170 | 9 | VERDICT | `NOT GUILTY` docked | Verdict block scales down and docks to the upper third, clearing the lower frame. | thump |
| 40 | 1200 | 10 | LOCKUP | `thecatcourt` | Lockup mask-reveals centre frame; a gold hairline draws outward from its centre in both directions. | click |
| 41 | 1230 | 10 | LOCKUP | + `CASE 02` / `THE 4 A.M. SPRINT` | Next-case lines type on beneath the hairline. | tick |
| 42 | 1260 | 10 | LOCKUP | (clearing) | Lockup and text compress into the single gold hairline. Behind it, the frame-0 table edge draws back in and the 7 mug fragments reassemble onto it. | whoosh |
| 43 | 1290 | 10 | LOCKUP | — | Hairline closes to nothing. Mug sits at rest on the table edge; the paw silhouette is entering frame-right at exactly its frame-0 position and velocity. | (none) |

---

## 4. The three exhibit mechanisms

They share no layout, no axis of motion and no reveal.

**Exhibit A — the anatomical cutaway with a swept parameter.** A square card. The underside of a
forepaw draws itself by stroke-dash reveal: outline first, then the five pad shapes. Receptor dots
then pepper into the pads and start pulsing. A frequency scale sweeps along the card's base from
20 Hz to 400 Hz over one beat, and the dots pulse faster and brighter in lockstep with the sweep,
so the sweep is literally driving the anatomy. The sweep stopping is what cues the claim slam.
*Dominant motion: a horizontal parameter sweep driving a radial pulse. Static frame, animated interior.*

**Exhibit B — the process track the subject walks.** The square card rotates about its horizontal
axis and flattens into a full-width left-to-right track. Five station ticks snap onto it and stamp
their words — POKE, BAT, SCOOP, POUNCE, GRASP — one per 6 frames. A paw glyph then travels the
track end to end, and each station flares gold and sprouts a short motion arc as the paw passes it.
The track then compresses from both ends toward centre into a single bar, which becomes the next
exhibit's container.
*Dominant motion: translation along one axis, left to right. The viewer's eye is dragged horizontally.*

**Exhibit C — the physical experiment with its prediction drawn first.** The compressed bar extrudes
upward into an opaque box. The box shakes on the off-eighths, emitting three gold sound arcs per
shake — the rattle. It then rotates a full 180° about its own base. Critically, the dashed
predicted arc draws itself *ahead* of the object, then the object drops out along it and lands on
the predicted endpoint, at which point the dash solidifies. The prediction preceding the event is
the whole exhibit.
*Dominant motion: rotation plus a vertical fall. Volumetric, not planar.*

---

## 5. Loop note

Beat 42 runs the opening in reverse while clearing the lockup: the lockup type compresses into a
single gold hairline, and behind that hairline the frame-0 table edge draws back in while the seven
mug fragments from beat 3 reassemble onto it. By beat 43 the hairline has closed to nothing, the
mug is at rest on the table edge, and the paw silhouette is entering frame-right.

The loop contract is on **position and velocity**, not just position: the paw's x-offset and its
per-frame delta at frame 1319 must equal its values at frame 0, so the strike at frame 0 reads as
the continuation of a motion already in progress rather than a restart. Frame 1319 and frame 0 are
the same image; the thump on beat 0 is the loop's downbeat.

---

## 6. Sources

Every on-screen factual claim, its source, and what the source actually says.

**Claim: `THE PAW IS A SENSOR` / "Pad receptors sharpen as vibration speeds up."**
- Hämäläinen H, Pertovaara A (1984). *Vibrotactile thresholds in mechanoreceptive afferents
  innervating the foot pad of the cat: the importance of stimulus frequency and duration.* Acta
  Physiologica Scandinavica 120(3):321-327. https://pubmed.ncbi.nlm.nih.gov/6741569/
- What it says: thresholds were measured for slowly-adapting, rapidly-adapting and Pacinian units
  in the cat foot pad at 20, 80 and 240 Hz. Both absolute and tuning thresholds of the Pacinian
  units **decreased** as vibration frequency increased — i.e. those pad receptors become more
  sensitive the faster the vibration. (SA and RA thresholds rose, which is why the claim is scoped
  to "pad receptors sharpen", carried by the PC population, and not to the whole paw indiscriminately.)

**Claim: the on-screen frequency scale `20 Hz → 400 Hz` (beat 14)**
- Greenstein J, Kavanagh P, Rowe MJ (1987). *Phase coherence in vibration-induced responses of
  tactile fibres associated with Pacinian corpuscle receptors in the cat.* Journal of Physiology
  386:263-275. https://pmc.ncbi.nlm.nih.gov/articles/PMC1192461/
- What it says: sinusoidal vibration in the range 100-400 Hz was applied to cat forelimb footpads
  with a 1 mm probe while recording from Pacinian-corpuscle afferents. Combined with Hämäläinen's
  20 Hz lower bound, the 20-400 Hz span on screen is the union of the two studies' tested ranges —
  it is a *tested* range, not a claimed physiological limit, and the graphic must not imply a cutoff.

**Claim: `BATTING IS HUNTING` / "Object play repeats poke, bat, scoop, pounce, grasp."**
- Delgado M, Hecht J (2019). *A review of the development and functions of cat play, with future
  research considerations.* Applied Animal Behaviour Science 214:1-17.
  https://gwern.net/doc/cat/psychology/2019-delgado.pdf
- What it says, verbatim: "Object-focused play incorporates behavioral sequences like those observed
  in prey handling, prey capture, and post-hunting prey manipulation such as poke/bat, scoop, leap,
  pounce, grasp, and bite or mouth." The five on-screen station words are drawn directly from that
  list. The same review notes object play emerges around 4 weeks and peaks at 18-21 weeks.

**Claim: `CATS PREDICT THE DROP` / "A rattle makes a cat expect something to fall."**
- Takagi S, Arahori M, Chijiiwa H, Tsuzuki M, Hataji Y, Fujita K (2016). *There's no ball without
  noise: cats' prediction of an object from noise.* Animal Cognition 19:1043-1047.
  https://link.springer.com/article/10.1007/s10071-016-1001-6
- What it says: an expectancy-violation procedure. Containers were shaken either with or without a
  rattling object inside, then turned over, with the sound/object relation congruent or incongruent.
  Cats looked longer at containers shaken with noise, and their behaviour at the turning-over phase
  indicated they expected an object to appear. The authors conclude cats "used a causal-logical
  understanding of auditory stimuli to predict the appearance of invisible objects."
- Scope guard: this study is about inferring an *unseen* object from sound and expecting it to drop.
  It is **not** a study of cats pushing things off tables, and the exhibit does not claim it is.

**Claim: `25-36 CM` / `NEAR POINT · 4 CATS` / `ANY CLOSER IS BLUR`**
- Bloom M, Berkley MA (1977). *Visual acuity and the near point of accommodation in cats.* Vision
  Research 17(6):723-730. https://www.sciencedirect.com/science/article/abs/pii/S0042698977800102
- What it says: the near point of accommodation was determined in four cats by measuring grating
  acuity at viewing distances from 125 cm down to 12 cm, taking the near point as the closest
  distance that just produced a decrement in acuity. Values ranged from 25 to 36 cm.
- This is why the counter lands on 25 and then **opens to the range on the next beat**. Showing 25
  alone would imply every cat focuses to 25 cm; 25 is the best case of four animals.

**Corroborating source for the same claim (independent, clinical):**
- *Feline ophthalmology, part 1.* Irish Veterinary Journal 59(3), March 2006, continuing education.
  https://www.eyevet.ie/wp-content/uploads/2009/02/feline-ophthalmology-part-12.pdf
- What it says, verbatim: cats "can only accommodate about four dioptres, compared to 14 dioptres in
  a human infant, or seven to eight dioptres in a 30-year-old adult." Four dioptres corresponds to a
  near point of 1/4 m = 25 cm, which is the optical derivation of Bloom & Berkley's lower bound.

### Claims dropped during fact-check

| Dropped claim | Why |
|---|---|
| "Cats push things off tables for attention." | No primary study on table-pushing and owner attention. Universal in listicles, unsupported. |
| "Cats push things off tables to test gravity / run experiments." | The popular framing of Takagi 2016. The study tested expectation about an unseen object from sound, not table-pushing. Over-extension. |
| "Cats push objects to check whether they are prey or alive." | Mechanistically plausible and consistent with the Delgado ethogram, but no study tests it for table-pushing specifically. Not asserted. |
| "The paw is a cat's most sensitive body part." | Unsourceable superlative; no comparative innervation-density study found. |
| "Whiskers detect air-current changes of ~1 micron." | Widely repeated figure with no traceable primary source. |
| "Cats have 24 whiskers." | Commonly stated; no credible primary count found, and it is not load-bearing for the argument. |

The honest state of the science is that **no peer-reviewed study explains why cats push objects off
surfaces.** The film is built around that: the prosecution has no cause of action, three real
findings about feline sensation and play are entered as evidence, and the acquittal is on the
absence of proven intent — not on a claimed alternative motive. That is why the conceit survives
the fact-check, and why no exhibit on screen says "because".
