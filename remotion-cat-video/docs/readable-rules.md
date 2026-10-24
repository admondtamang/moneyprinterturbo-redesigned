# thecatcourt — readable cut rules (Film 03)

These **supersede** `docs/motion-rules.md` for anything under `src/reel/readable/`.
Films 01/02 keep the old rules; they are shipped and unchanged.

## Why this file exists
Film 01 was built on "something new must happen every beat, no static holds." That is showreel
logic. It produced 44 events in 22s, and the viewer's verdict was: *"too fast, I can't read, some
screens just go off."* Slowing the same timeline did not fix it, because the fault was event
DENSITY, not tempo. This cut has 11 moments in 60s.

## The reading contract — enforced by `src/reel/moments.check.ts`
- A **moment** is one thing you read. Timings live in `src/reel/moments.ts` and **nowhere else**.
- Entrance animation does **not** count as reading time. Budget `dur - 0.9s` as the real hold.
- Required hold = `max(2.5s, words / 2.5)`. Nothing readable is ever on screen under 2.5s.
- **Nothing exits while it is still the newest thing on screen.** Hold, then leave.
- No gaps, no overlaps between moments. The check fails the build on either.

## Look — light editorial
- Palette is `src/reel/paperPalette.ts`. Contrast is asserted by `src/reel/paper.check.ts`;
  do not introduce a colour that has not been through it.
- Warm paper ground. The film is a court document, not a title card.
- **Two inks, one signal.** `ink` for type, `ink2` (blue) for data and measurement,
  `accent` (red) for the stamp and exactly one emphasis per screen. Never a second red.
- `muted` is for labels only and never below 32px.

## Still banned (carried over, these were right)
Centred title on a gradient; everything fading in; glow; drop shadows as depth; generic particle
bursts; emoji as iconography; a second display face.

## Newly banned (these caused the failure)
- **Text arriving and leaving inside one beat.** If it is readable, it holds.
- **Decorative motion during a hold.** Once type has settled, the screen is calm. Movement while
  someone is reading is what makes text feel like it "goes off".
- **More than one new idea per moment.** A label, a headline and its detail are one idea.
- **Counting animation on a number the viewer must read.** Land it, then hold it still.

## Motion, now that it is doing less
- Entrances stay fast and crisp (`src/reel/motion.ts`, `slam`/`maskReveal`) — ~0.4-0.6s.
- Then **stop**. The hold is genuinely still, apart from at most one slow ambient element
  (a hairline drawing, a very slow drift) that is not the thing being read.
- Exits are quick and get out of the way of the next moment.

## Type
`docs/type-scale.md` still governs sizes — read the "Use" column. On paper ground, type is
DARK on light, so weights can be one step lighter than on the dark cut without losing legibility.
