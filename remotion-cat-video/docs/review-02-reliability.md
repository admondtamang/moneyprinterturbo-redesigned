# Reliability review — Film 02 (narrated cut)

**VERDICT: SHIP WITH FIXES.**

**TL;DR** — The central negative claim holds: I searched adversarially and found **no peer-reviewed
study explaining why cats push objects off surfaces**, in 2024-2026 or earlier. All four on-screen
exhibit/number claims trace correctly to their cited sources; I fetched or independently confirmed
every one. The problem is **not** the picture — it is the **narration**. Three of the eight spoken
lines assert an alternative *motive* for the push, which is precisely what the fact-check removed
and precisely what the film's own verdict line denies 10 seconds later. One of those three
("Expectation, not design.") restates dropped folklore claim #2 almost verbatim.

**Reviewed:** `src/facts/thecatcourt02Narration.ts`, `docs/shotlist.md` §2.3-2.6 + §6,
`docs/review-brief-02.md`, `docs/brief.md`. **Date:** 2026-10-04.
**Finding count:** 1 BLOCKER-adjacent (MAJOR, structural), 2 MAJOR, 5 MINOR, 4 verified clean.

---

## 1. Claim table

| Claim | Where | Source | Source supports it? | Severity |
|---|---|---|---|---|
| `THE PAW IS A SENSOR` | Beat 15, on screen | Hämäläinen & Pertovaara 1984 | Yes. PC afferents in the cat foot pad are vibration receptors. | CLEAN |
| "Pad receptors sharpen as vibration speeds up." | Beat 15, detail line | Hämäläinen & Pertovaara 1984 | **Partly.** True for PC units only; SA and RA thresholds were *elevated* with frequency. Unqualified "pad receptors" asserts a property two of three measured unit types do not have. | **MAJOR** |
| `20 Hz → 400 Hz` continuous sweep, dots brightening monotonically | Beat 14, on screen | Hämäläinen 1984 (20/80/240 Hz) + Greenstein 1987 (100-400 Hz) | Range is a real union of tested ranges (confirmed: Greenstein applied 100-400 Hz to cat forelimb footpads). But the *continuous monotonic brighten* asserts a trend across points neither study sampled, and Greenstein measured phase coherence, not thresholds. | MINOR |
| `BATTING IS HUNTING` | Beat 19, on screen | Delgado & Hecht 2019 | Overstated as identity. Source says object play "incorporates behavioral sequences **like those observed in** prey handling". Resembles ≠ is. Qualified by the detail line directly beneath. | MINOR |
| "Object play repeats poke, bat, scoop, pounce, grasp." | Beat 19, detail line | Delgado & Hecht 2019 | Yes — verbatim-sourced word list, verified in the PDF (p. "Object-focused play incorporates behavioral sequences … such as poke/bat, scoop, leap, pounce, grasp, and bite or mouth"). Two items (leap, bite/mouth) dropped for length, which is selection not distortion. | CLEAN |
| Exhibit B track: paw walks five stations **left to right in order** | Beats 17-18, visual | Delgado & Hecht 2019 | **No.** The source gives an unordered list of behaviours, not a fixed pipeline. The track mechanism asserts an ordering the source does not. "Repeats" in the detail line compounds this. | MINOR |
| `CATS PREDICT THE DROP` / "A rattle makes a cat expect something to fall." | Beat 23 | Takagi et al. 2016 | Yes. Cats looked longer at containers shaken with noise; authors conclude cats "used a causal-logical understanding of auditory stimuli to predict the presence of invisible objects." Expecting the object to drop out on overturn is the study's own procedure. | CLEAN |
| `25-36 CM` | Beat 29 | Bloom & Berkley 1977 | Yes. "The near point of accommodation was determined in four cats … values obtained ranged from 25 to 36 cm." Exact. | CLEAN |
| `NEAR POINT · 4 CATS` | Beat 29 | Bloom & Berkley 1977 | Yes, and disclosing n=4 on screen is good practice. | CLEAN |
| `ANY CLOSER IS BLUR` + hatch at 25 cm | Beat 30 | Bloom & Berkley 1977 | Directionally yes, and **conservatively** so — 25 cm is the best of four animals, so "closer than 25 is blurred" is true for all four. But "blur" overstates the measurement, which was "the closest distance that just produced a decrement in acuity". | MINOR |
| `25 CM` shown alone (beat 28) before the range opens (beat 29) | Beats 28-29 | Bloom & Berkley 1977 | Mitigated by design — the range arrives one beat later. At 75 BPM that single value is on screen alone for 0.8s, not 0.5s. Still acceptable. | MINOR |
| "The mug had help." | Narration, 0.4s | — | Not a scientific claim; it restates the film's depicted premise. | CLEAN |
| "The prosecution alleges deliberate intent." | Narration, 3.4s | — | Framing. Correctly attributes intent to the *allegation*, not to fact. | CLEAN |
| **"Sensation, not intent."** | Narration, 9.8s | Hämäläinen 1984 | **No.** The exhibit shows the paw *can* sense vibration. It does not show that sensation, rather than intent, drove the push. | **MAJOR** |
| **"Play, not malice."** | Narration, 13.0s | Delgado & Hecht 2019 | **No.** Same shape. The review shows object play resembles prey-handling; it does not show this push was play. | **MAJOR** |
| **"Expectation, not design."** | Narration, 16.2s | Takagi 2016 | **No — and this is the worst one.** It asserts the cat pushed in order to confirm an expectation. That is dropped folklore claim #2 ("cats push things off tables to test gravity / run experiments"), the exact over-extension of Takagi the fact-check removed. | **MAJOR (blocker-adjacent)** |
| "The mug sits inside that distance." | Narration, 19.8s | Bloom & Berkley 1977 + geometry | Defensible. A mug at the edge of a table the cat stands on is typically well inside 25 cm of the cat's eyes. It is a geometric inference, not a sourced finding, and the voice states it flatly. | MINOR |
| "No study explains why. Intent is unproven." | Narration, 26.4s | — (negative claim) | **Verified true as of 2026-10-04.** See §4. | CLEAN |
| `NOT GUILTY` / `CHARGE DISMISSED` | Beats 33-37 | — | Honest. "Not guilty" and "dismissed" are both not-proven verdicts, not findings of innocence. The conceit is doing the right legal thing here. | CLEAN |
| "The next defendant runs." / `THE 4 A.M. SPRINT` | Narration 32.2s / beat 41 | — | Tease. Asserts nothing factual. | CLEAN |

---

## 2. The structural problem — the narration contradicts the verdict

This is the one finding that would make me hold the film.

The shotlist's own fact-check closes with: *"the acquittal is on the absence of proven intent — not
on a claimed alternative motive. That is why the conceit survives the fact-check, and why no exhibit
on screen says 'because'."*

The picture honours that. The **narration breaks it.** Over 6.4 seconds, three fragments each name a
cause and deny intent:

> `Sensation, not intent.` → `Play, not malice.` → `Expectation, not design.`

Each is an X-not-Y construction, which in plain speech asserts that X is the case and Y is not. Ten
seconds later the same voice says *"No study explains why."* A viewer who hears both has been told
the answer and then told there is no answer. The film's whole defensibility rests on the second
statement; the first three undercut it, and they do so in the compressed register where nobody can
hear the qualifier that isn't there.

There is a defensible reading — "this exhibit speaks to sensation, not to intent", i.e. a comment on
the *evidentiary category* rather than on the cat's motive. That reading is available but it is not
the dominant one when the line is spoken over an animated paw with no framing clause. The fix is
cheap, keeps the legal register, keeps the word count inside the measured 1.5 w/s budget, and removes
the misreading entirely.

### Proposed replacements

**`evidence-a`**
- Current: `Sensation, not intent.`
- Proposed: `This proves sensation.` (3 words)
- Why: states what the exhibit establishes. Drops the "not intent" clause, which was doing the
  causal-assertion work. The audience still gets the acquittal arc from `NOT GUILTY`.

**`evidence-b`**
- Current: `Play, not malice.`
- Proposed: `This proves play.` (3 words)
- Why: same shape, same length, same rhythm across the three exhibits.

**`evidence-c`**
- Current: `Expectation, not design.`
- Proposed: `This proves expectation.` (3 words)
- Why: same, and critically it no longer says the cat *designed* or *didn't design* anything. The
  Takagi finding is about inferring an unseen object from sound; the replacement claims only that.

If the director wants to keep the X-not-Y cadence for sound reasons, the minimum safe variant is to
move the negation onto the *proof*, not the behaviour:

- `Sensation proven. Intent not.` / `Play proven. Intent not.` / `Expectation proven. Intent not.`

That is 4 words each (~2.7s at 1.5 w/s), still inside every 3.2s window, and it sets up the verdict
line instead of contradicting it. Either option is acceptable; the current wording is not.

### Secondary fix — `deliberation`

- Current: `The mug sits inside that distance.`
- Proposed: `A table-edge mug sits inside that.` (6 words)
- Why: MINOR only. The current line is fine on the geometry; the proposal just makes explicit that
  this is the standing-on-the-table case the picture shows, rather than a universal assertion about
  mugs. Take it or leave it.

### `THE PAW IS A SENSOR` detail line

- Current: `Pad receptors sharpen as vibration speeds up.`
- Proposed: `The fastest-tuned pad receptors sharpen as vibration speeds up.`
  (or, at the ≤10-word budget: `Deep pad receptors sharpen as vibration speeds up.`)
- Why: MAJOR. Hämäläinen & Pertovaara measured three unit classes. PC thresholds **decreased** with
  frequency; SA and RA thresholds **rose**. RA units were in fact most sensitive at 20 Hz, the low end
  of the on-screen sweep. The unqualified plural "pad receptors" states as general a property that
  holds for one of three populations. The shotlist knows this — §6 says the claim "is scoped to
  'pad receptors sharpen', carried by the PC population". That scoping exists only in the shotlist;
  nothing on screen carries it. One adjective fixes it.

---

## 3. Did dropped folklore come back?

| Dropped claim | Back in the film? |
|---|---|
| Push for attention | No. Nothing in picture or voice implies an audience. |
| Push to test gravity / run experiments | **Yes, via `Expectation, not design.`** See §2. This is the over-extension of Takagi the fact-check explicitly named and removed. |
| Push to check whether prey or alive | **Partially, via `Sensation, not intent.` and `Play, not malice.`** Not stated, but the two fragments together imply the prey-testing motive the fact-check declined to assert. |
| Paw is the most sensitive body part | No. `THE PAW IS A SENSOR` is a category claim, not a superlative. Correctly avoided. |
| Whiskers / 1-micron air currents | No. No whisker content anywhere. |
| Cats have 24 whiskers | No. |

Four of six stayed out cleanly. Two came back through the narration's compression, and both arrive in
the X-not-Y fragments. Fixing §2 fixes this section too — no separate change needed.

---

## 4. Is the central negative claim still true?

**Yes, as of 2026-10-04.** I searched specifically for a study that explains object-pushing, including
2024-2026 work, across several phrasings. What exists:

- **No peer-reviewed experimental study of cats pushing objects off surfaces, full stop.** Every
  popular source returned — veterinary blogs, pet-brand content marketing, a Futura-Sciences piece
  headlined *"This is finally why your cat keeps knocking things off the table"* — cites **zero**
  primary research. I fetched the Futura piece specifically because the headline claimed a resolution;
  it cites no author, no journal, no year, and carries product placement.
- **Recent genuine cat-cognition work is adjacent, not on point.** Forman, Rowe & Leavens 2025
  (*PLOS One*, object permanence via violation-of-expectancy), Kim & Johns 2025 (*Animal Behavior and
  Cognition*, responses to reflective images), and the 2024 cat/dog fetching prevalence paper are all
  real and all about something else.
- **One false positive worth naming.** arXiv:2503.22919, "Feline gravity manipulation" (Toth, posted
  2025-03-29, gr-qc) surfaces on searches for cats and gravity. It is a satirical preprint proposing
  cats modulate their gravitational mass, is not peer-reviewed, and is not evidence of anything. Do
  not let it into a future fact-check as a hit.

The premise survives. This was the single most important thing to check and it came back clean.

---

## 5. Generalisation check (n=4)

Handled better than I expected.

- `NEAR POINT · 4 CATS` puts the sample size on screen, in the same beat as the number. Most facts
  channels would not.
- The counter lands on `25` then opens to `25-36` one beat later, so no viewer leaves with a single
  value. The shotlist states this was a deliberate decision; the beat table confirms it was built.
- The hatched blur zone is drawn at **25 cm**, the *best* of the four animals. That makes
  `ANY CLOSER IS BLUR` true for every cat in the sample rather than only the median one. This is the
  conservative choice and it is the right one.

The only residue is the narration's `The mug sits inside that distance.`, which generalises from four
anaesthetised-lab-measured animals to "the cat in this film" without a hedge. MINOR; optional fix in §2.

---

## 6. Is the framing honest?

Yes, on the point that matters most. `NOT GUILTY` and `CHARGE DISMISSED` are both not-proven
dispositions, not findings of innocence, and the film never says "innocent", "proven innocent", or
"cleared". The conceit is using the one legal vocabulary that happens to map exactly onto the
epistemic situation: evidence insufficient, charge fails, nothing affirmatively established. That is a
genuinely good piece of design and it is why the film is defensible at all.

Two notes, neither a fix:

- `docs/brief.md`'s logline — *"the court acquits it because the science is on the cat's side"* — is
  stronger than anything on screen. It is an internal document and nobody watching sees it, so it is
  not a finding. But if that sentence ever becomes a caption, a title, or a description, it becomes a
  MAJOR. Flagging it now.
- Likewise `docs/shotlist.md` §1: *"every piece of behavioural evidence says the paw was an instrument
  of inspection, not of malice."* Same status — internal, not on screen, and the exact assertion the
  narration fragments accidentally promote to spoken text. The leak path from internal framing to
  spoken line is visible here; §2's fix closes it.

---

## 7. What I verified independently

Fetched or confirmed directly, not taken from the shotlist's summary:

| Source | How | Result |
|---|---|---|
| Hämäläinen & Pertovaara 1984, *Acta Physiol Scand* 120(3):321-327 | Abstract recovered via search (PubMed and EuropePMC both blocked: cookie wall / HTTP 403). Publisher record: https://onlinelibrary.wiley.com/doi/abs/10.1111/j.1748-1716.1984.tb07390.x | Confirmed: "absolute and tuning thresholds of SA and RA units were elevated, while those of PC units were decreased as a function of increasing vibration frequency"; PC lowest at 80 and 240 Hz, RA lowest at 20 Hz. Drives the §2 MAJOR. |
| Greenstein, Kavanagh & Rowe 1987, *J Physiol* 386:263-275 | Full text fetched: https://pmc.ncbi.nlm.nih.gov/articles/PMC1192461/ | Confirmed: "sinusoidal vibratory stimuli at 100-400 Hz … delivered using a 1 mm diameter probe", cat forelimb footpads, recording from Pacinian-corpuscle afferents. The 400 Hz upper bound is real and tested. |
| Delgado & Hecht 2019, *Appl Anim Behav Sci* 214:1-17 | PDF fetched and text-extracted: https://gwern.net/doc/cat/psychology/2019-delgado.pdf | Quote confirmed **verbatim**: "Object-focused play incorporates behavioral sequences like those observed in prey handling, prey capture, and post-hunting prey manipulation such as poke/bat, scoop, leap, pounce, grasp, and bite or mouth". Note: the source says object play *emerges and peaks* at 18-21 weeks; interest in moving objects appears by 4 weeks. The shotlist's "emerges around 4 weeks and peaks at 18-21 weeks" is a slight misread — harmless, since neither figure is on screen. |
| Takagi et al. 2016, *Animal Cognition* 19:1043-1047 | Springer page 303-redirected to an auth endpoint; abstract confirmed via search + press release. https://link.springer.com/article/10.1007/s10071-016-1001-6 | Confirmed: congruent/incongruent shake-and-overturn design; cats looked longer at containers shaken with noise; conclusion "cats used a causal-logical understanding of auditory stimuli to predict the presence of invisible objects". |
| Bloom & Berkley 1977, *Vision Research* 17(6):723-730 | Abstract confirmed via search; publisher record https://www.sciencedirect.com/science/article/abs/pii/S0042698977800102 (full text paywalled) | Confirmed: "near point of accommodation was determined in four cats by measuring visual acuity at viewing distances varying from 125 to 12 cm. The values obtained ranged from 25 to 36 cm." Exact match to `25-36 CM` and `NEAR POINT · 4 CATS`. |
| The negative claim — no study explains object-pushing | Four independent searches, 2024-2026 scoped; fetched https://www.futura-sciences.com/en/this-is-finally-why-your-cat-keeps-knocking-things-off-the-table-and-its-not-just-mischief_34645/ and https://arxiv.org/abs/2503.22919 | No primary research found. The one headline claiming a resolution cites nothing; the one arXiv hit is satire. Claim holds. |

**Access caveats — stated as access failures, not as absence of support:** PubMed returned a cookie
wall, EuropePMC returned HTTP 403, Semantic Scholar returned HTTP 403, and Springer and ScienceDirect
are paywalled for Takagi and Bloom & Berkley respectively. For all four I recovered the abstract text
through other indexes and it matched the shotlist. I did **not** read the full methods of Bloom &
Berkley or Hämäläinen. Nothing I could not access contradicted anything; I simply could not
independently check beyond abstract level for those two.

---

## 8. Summary of required changes

| # | File | Current | Proposed | Severity |
|---|---|---|---|---|
| 1 | `src/facts/thecatcourt02Narration.ts` `evidence-a` | `Sensation, not intent.` | `This proves sensation.` | MAJOR |
| 2 | `src/facts/thecatcourt02Narration.ts` `evidence-b` | `Play, not malice.` | `This proves play.` | MAJOR |
| 3 | `src/facts/thecatcourt02Narration.ts` `evidence-c` | `Expectation, not design.` | `This proves expectation.` | MAJOR |
| 4 | Exhibit A detail line (shotlist §2.3 + scene source) | `Pad receptors sharpen as vibration speeds up.` | `Deep pad receptors sharpen as vibration speeds up.` | MAJOR |
| 5 | `src/facts/thecatcourt02Narration.ts` `deliberation` | `The mug sits inside that distance.` | `A table-edge mug sits inside that.` | MINOR (optional) |

Changes 1-3 require a voiceover re-render. Word counts are equal or lower than the current lines, so
every act window still fits at the measured 1.5 w/s rate and `NARRATION_START_SECONDS` does not move.
Change 4 is on-screen type only. Nothing here touches Film 01.

With 1-4 applied, this ships.
