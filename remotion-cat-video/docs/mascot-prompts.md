# Rizz mascot — generation prompts

Use the **existing** `public/mascot/rizz.png` as a reference/input image on every
generation. Do not generate from text alone — the character will drift between runs.

## Step 1 — establish the new pose (generate once, then freeze it)

> Using the attached cartoon cat as the exact character reference, redraw him in a new
> pose: turned three-quarters to his left so he faces toward the right side of the
> frame, head tilted slightly up and toward the viewer, both front paws resting
> relaxed in front of his chest. Crop at mid-thigh — head, chest and front paws only,
> not the full body. Keep every other detail identical to the reference: the same
> ginger-and-cream fur pattern, the same green eyes, the same red bow tie centred at
> the throat, the same soft 3D render style and fur shading. Mouth closed and neutral.
> Flat even key light from the front-left, no rim light, no coloured glow.
> Transparent background. No drop shadow, no ground shadow, no contact shadow.
> No text, no border, no frame. Centre the character with no empty padding.
> Output a tall portrait image at least 1000 pixels high.

Save the winner as `rizz-X.png`. **Every later prompt uses this file as the reference,
not the original.** That is what keeps the set consistent.

## Step 2 — the mouth set (6 generations, one per shape)

Same prompt each time, swapping only the bracketed line:

> Using the attached cartoon cat as the exact character reference, change **only his
> mouth**. Everything else must be pixel-identical to the reference: identical pose,
> identical head angle, identical eye shape and gaze direction, identical paw
> position, identical bow tie, identical fur shading, identical lighting, identical
> framing and identical canvas size. Do not move, rescale, or re-light the character.
> New mouth shape: **[SHAPE]**
> Transparent background, no shadow, no text.

| File | `[SHAPE]` |
|---|---|
| `rizz-A.png` | lips pressed completely shut in a soft closed line, as when saying "M" or "B" |
| `rizz-B.png` | mouth slightly open, a narrow horizontal gap, small teeth nearly touching, as when saying "EE" |
| `rizz-C.png` | mouth open in a relaxed oval about as tall as it is wide, as when saying "EH" |
| `rizz-D.png` | mouth wide open, jaw dropped, small pink tongue visible at the bottom, as when saying "AA" |
| `rizz-E.png` | mouth rounded and moderately open, lips pushed slightly forward, as when saying "AW" |
| `rizz-F.png` | mouth in a small tight pucker, a narrow circle, as when saying "OO" |

## Step 3 — the eye variants (2 generations)

> Using the attached cartoon cat as the exact character reference, change **only his
> eyes**. Everything else pixel-identical — same pose, same mouth, same paws, same
> lighting, same framing, same canvas size.
> New eyes: **[EYES]**
> Transparent background, no shadow, no text.

| File | `[EYES]` |
|---|---|
| `rizz-blink.png` | both eyes fully closed, drawn as two soft downward-curving lashes |
| `rizz-brow.png` | eyes open as in the reference, but both brows raised high in surprise |

## Measured results — Nano Banana (fal-ai/nano-banana/edit), 2026-10-24

Two runs through Weave. Findings, both costly to rediscover:

1. **Never write "as when saying X"** in a mouth prompt. Run 2 rendered a literal
   letter **M** on the cat's face. Describe the shape physically instead:
   "lips pressed shut in a soft closed line", not "as when saying M".
2. **The model re-frames on every generation.** Reference in at 810x940; output
   came back 960x1088, zoomed in, with the gaze shifted. "Identical canvas size",
   "do not re-crop", "pixel-identical" were all ignored. Separate per-viseme runs
   therefore **cannot** produce a registered set — the drift is a changed zoom
   level, which alignment cannot undo.
3. **No alpha.** Output is `rgb24` on pure black regardless of the transparency
   request. Recover with a border flood-fill (NOT a global black key — that
   punches holes through the pupils). The fill is cheap and lossless at the fur
   edges if you feather by luma.
4. The mid-thigh crop instruction was also ignored (full body returned). Cheaper
   to crop with ffmpeg than to re-roll.

**Conclusion: the viseme set must come from ONE generation.** A single grid image
cannot drift from itself. That needs a model with a resolution control — Nano
Banana 2.1 at 2K/4K gives ~1000px panels from a 2x3 grid; the original model caps
near 1MP, which yields ~430px panels, below the 620px render width.

## If the generator drifts

Symptoms and fixes, in the order worth trying:

1. **Pose shifts between shapes** — generate the mouth set as a *single* image: "a 2x3
   grid of the same cat, identical in every panel except the mouth, panel 1 …, panel 2
   …". One generation cannot drift from itself. Slice the grid with ffmpeg afterwards.
2. **Canvas size differs** — normalise after the fact rather than re-rolling; send me
   the files and I will pad every one to a common canvas against the same anchor.
3. **Shadow keeps appearing** — ask for "the character floating on pure transparency,
   as a game sprite with no environment".
4. **White halo at the edges** — generate on a solid mid-grey background instead of
   transparent and let me key it out; a hard key beats a bad alpha matte.
