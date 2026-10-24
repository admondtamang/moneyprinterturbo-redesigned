// Film 03 — shared visual furniture for the readable cut.
//
// THE LOOK: a court document, printed on warm paper. Judicial, editorial, calm.
// Everything a moment needs to sit on the page lives here, so no scene file hardcodes a
// colour, a type size or a margin. Rules: docs/readable-rules.md (supersedes motion-rules.md
// for this directory). Palette: ../paperPalette.ts. Sizes: docs/type-scale.md "Use" column.
//
// PURITY: every export is a pure function of useCurrentFrame(). No state, no Date.now(),
// no Math.random() (Remotion's random(seed) only), no CSS transitions.
//
// TIMING: components never own their schedule. Pass `at` (the frame the element starts its
// entrance). Omit `at` and the element renders fully settled — which is also what makes the
// hold genuinely still: once the wipe is done nothing here moves again.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { paper } from "../paperPalette";
import { FIRM, maskReveal, springAt } from "../motion";
import { sans, serif } from "../../facts/fonts";
import { CatHead } from "../glyphs";

// ---------------------------------------------------------------------------
// Page geometry. Safe area is x 72-1008 / y 180-1500 (YouTube overlays the bottom of a Short).
// The text column is 856px wide, matching the measured column in docs/type-scale.md.
// ---------------------------------------------------------------------------
export const PAGE = {
  /** Trim box — the printed area. Corner register marks sit on these corners. */
  left: 72,
  right: 1008,
  top: 212,
  bottom: 1452,
  /** Text column. Indented from the trim so the margin rule has room to live in. */
  colLeft: 128,
  colRight: 984,
  colWidth: 856,
  /** Masthead: a heavy rule, then a hairline 14px under it. Content starts below. */
  headRuleY: 236,
  headHairY: 250,
  /** Footer hairline; the slug sits ABOVE it (below it collides with the register mark). */
  footRuleY: 1420,
  /** Usable band between the masthead and the footer rule: 1170px, centred on y=835. */
  bodyTop: 250,
  bodyBottom: 1420,
} as const;

/** Type scale, from docs/type-scale.md "Use" column. On paper the ink is dark on light, so
 *  display weight drops 900 -> 700 and body 500 -> 400 without losing the strip. */
export const TYPE = {
  labelSize: 44,
  headlineSize: 64,
  detailSize: 38,
  slugSize: 32,
} as const;

/** House entrance: a 0.4s left-to-right wipe. One idiom for every text element, because a
 *  document is printed, not faded in. 0.4s in, then completely still. */
const WIPE = 24;

const useWipe = (at: number | undefined, durationInFrames = WIPE) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (at === undefined) {
    return { progress: 1, clipPath: "inset(0% 0% 0% 0%)" };
  }
  return maskReveal(frame, fps, at, durationInFrames);
};

export type Tone = "ink" | "inkSoft" | "muted" | "accent" | "ink2";
const toneColor = (t: Tone) => paper[t];

// ---------------------------------------------------------------------------
// PaperBackground — the ground. Warm stock, a faint fibre grain, nothing else.
// Completely static by construction: the grain is an SVG filter, not a frame-driven value.
// ---------------------------------------------------------------------------
export const PaperBackground: React.FC<{
  children?: React.ReactNode;
  grain?: boolean;
}> = ({ children, grain = true }) => (
  <AbsoluteFill style={{ backgroundColor: paper.bg }}>
    {children}
    {/* Grain sits ON TOP of the content, multiplying into it — the fibre is in the stock, so
     *  it is in the ink too. Underneath the content it would also expose any paper-coloured
     *  knockout as a lighter rectangle, which is exactly what it looked like in proof 2. */}
    {grain ? (
      <svg
        width={1080}
        height={1920}
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.07,
          mixBlendMode: "multiply",
        }}
      >
        <filter id="paperGrain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves={3}
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width={1080} height={1920} filter="url(#paperGrain)" />
      </svg>
    ) : null}
  </AbsoluteFill>
);

// NOTE: put DocumentFrame and every moment INSIDE PaperBackground as children, so the grain
// lands on top of them.

// ---------------------------------------------------------------------------
// Rule — the hairline divider. Draws left-to-right when given `at`, else just sits there.
// ---------------------------------------------------------------------------
export const Rule: React.FC<{
  width?: number | string;
  thickness?: number;
  color?: string;
  at?: number;
  durationInFrames?: number;
  style?: React.CSSProperties;
}> = ({
  width = "100%",
  thickness = 2,
  color = paper.rule,
  at,
  durationInFrames = WIPE,
  style,
}) => {
  const { progress } = useWipe(at, durationInFrames);
  return (
    <div
      style={{
        width,
        height: thickness,
        backgroundColor: color,
        transform: `scaleX(${progress})`,
        transformOrigin: "left center",
        ...style,
      }}
    />
  );
};

// ---------------------------------------------------------------------------
// Type. Three components, pre-set. A scene passes copy and a frame, never a font size.
// ---------------------------------------------------------------------------

/** Small tracked-out label above a headline: `EXHIBIT A`, `COUNT ONE`. Never below 32px. */
export const Label: React.FC<{
  children: React.ReactNode;
  at?: number;
  tone?: Tone;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, at, tone = "muted", size = TYPE.labelSize, style }) => {
  const { clipPath } = useWipe(at);
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 600,
        fontSize: size,
        lineHeight: 1.1,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: toneColor(tone),
        clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The thing you read. Fraunces, dark on paper. `size` carries the whole display range:
 *  64 for a claim, 150-190 for a hook fragment, 250 for the verdict. */
export const Headline: React.FC<{
  children: React.ReactNode;
  at?: number;
  size?: number;
  tone?: Tone;
  weight?: 600 | 700 | 900;
  style?: React.CSSProperties;
}> = ({
  children,
  at,
  size = TYPE.headlineSize,
  tone = "ink",
  weight,
  style,
}) => {
  const { clipPath } = useWipe(at);
  const big = size >= 120;
  return (
    <div
      style={{
        fontFamily: serif,
        fontWeight: weight ?? (big ? 900 : 700),
        fontSize: size,
        lineHeight: big ? 0.95 : 1.08,
        letterSpacing: big ? "-0.025em" : "-0.008em",
        color: toneColor(tone),
        fontVariantNumeric: "tabular-nums lining-nums",
        clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** The line under the claim. Inter 400 at 38px — the floor is 32 and the floor fails. */
export const Detail: React.FC<{
  children: React.ReactNode;
  at?: number;
  tone?: Tone;
  size?: number;
  style?: React.CSSProperties;
}> = ({ children, at, tone = "inkSoft", size = TYPE.detailSize, style }) => {
  const { clipPath } = useWipe(at, WIPE + 6);
  return (
    <div
      style={{
        fontFamily: sans,
        fontWeight: 400,
        fontSize: size,
        lineHeight: 1.42,
        letterSpacing: "0.005em",
        color: toneColor(tone),
        fontVariantNumeric: "tabular-nums lining-nums",
        maxWidth: PAGE.colWidth,
        clipPath,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Running head / footer slug. Tabular, tracked, muted — the furniture of a filed document. */
export const Slug: React.FC<{
  children: React.ReactNode;
  tone?: Tone;
  style?: React.CSSProperties;
}> = ({ children, tone = "muted", style }) => (
  <div
    style={{
      fontFamily: sans,
      fontWeight: 500,
      fontSize: TYPE.slugSize,
      letterSpacing: "0.26em",
      textTransform: "uppercase",
      color: toneColor(tone),
      fontVariantNumeric: "tabular-nums lining-nums",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// DocumentFrame — what makes it read as a document rather than a page with text on it.
// Masthead (heavy rule + hairline, letterhead mark, running head, docket in ink blue),
// a left margin rule, corner register marks, a footer hairline and slug.
// Children are absolutely positioned in composition space; use PAGE for coordinates.
// ---------------------------------------------------------------------------
const RegisterMark: React.FC<{ x: number; y: number; sx: number; sy: number }> = ({
  x,
  y,
  sx,
  sy,
}) => (
  <svg
    width={34}
    height={34}
    viewBox="0 0 34 34"
    style={{
      position: "absolute",
      left: x - (sx > 0 ? 0 : 34),
      top: y - (sy > 0 ? 0 : 34),
    }}
  >
    <g
      stroke={paper.rule}
      strokeWidth={2}
      fill="none"
      transform={`translate(${sx > 0 ? 0 : 34},${sy > 0 ? 0 : 34}) scale(${sx},${sy})`}
    >
      <path d="M0 0 H30" />
      <path d="M0 0 V30" />
    </g>
  </svg>
);

export const DocumentFrame: React.FC<{
  children?: React.ReactNode;
  /** Running head, left of the masthead. */
  title?: string;
  /** Right of the masthead, set in ink blue — the data voice. */
  docket?: string;
  footerLeft?: string;
  footerRight?: string;
  /** Letterhead glyph in the masthead. */
  mark?: boolean;
  /** Running text set vertically in the left margin — the binder spine of the document.
   *  This is furniture, not reading: it fills the margin band and is never the thing you read. */
  spine?: string;
  /** Faint horizontal ruling across the body, 76px pitch. Document stock, not notebook paper:
   *  it is texture at phone size and structure at full res, and TextBlock knocks it out behind
   *  its own type so nothing ever rules through a word. */
  ruled?: boolean;
  /** Drop the footer hairline + slug (the lockup wants a bare page). */
  footer?: boolean;
}> = ({
  children,
  title = "The Cat Court",
  docket = "No. 01-CAT",
  footerLeft = "Docket 01-CAT",
  footerRight = "Filed in session",
  mark = true,
  spine,
  ruled = true,
  footer = true,
}) => (
  <AbsoluteFill>
    {/* corner register marks on the trim box */}
    <RegisterMark x={PAGE.left} y={PAGE.top} sx={1} sy={1} />
    <RegisterMark x={PAGE.right} y={PAGE.top} sx={-1} sy={1} />
    <RegisterMark x={PAGE.left} y={PAGE.bottom} sx={1} sy={-1} />
    <RegisterMark x={PAGE.right} y={PAGE.bottom} sx={-1} sy={-1} />

    {/* body ruling — the stock the document is printed on */}
    {ruled ? (
      <div style={{ position: "absolute", left: PAGE.colLeft, top: PAGE.bodyTop + 76, width: PAGE.colWidth, height: PAGE.bodyBottom - PAGE.bodyTop - 152, overflow: "hidden" }}>
        {Array.from({ length: 13 }, (_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * 76,
              width: "100%",
              height: 1,
              backgroundColor: paper.rule,
              opacity: 0.55,
            }}
          />
        ))}
      </div>
    ) : null}

    {/* spine — vertical running head in the left margin */}
    {spine ? (
      <div
        style={{
          position: "absolute",
          left: PAGE.left + 2,
          top: PAGE.bottom - 80,
          transformOrigin: "left bottom",
          transform: "rotate(-90deg) translateY(-14px)",
        }}
      >
        <Slug style={{ letterSpacing: "0.34em" }}>{spine}</Slug>
      </div>
    ) : null}

    {/* left margin rule */}
    <div
      style={{
        position: "absolute",
        left: PAGE.left,
        top: PAGE.top + 56,
        width: 2,
        height: PAGE.bottom - PAGE.top - 112,
        backgroundColor: paper.rule,
      }}
    />

    {/* masthead */}
    <div
      style={{
        position: "absolute",
        left: PAGE.colLeft,
        top: PAGE.top - 76,
        width: PAGE.colWidth,
        display: "flex",
        alignItems: "center",
        gap: 20,
      }}
    >
      {mark ? <CatHead size={46} color={paper.ink} strokeWidth={9} /> : null}
      <Slug tone="inkSoft">{title}</Slug>
      <div style={{ flex: 1 }} />
      <Slug tone="ink2">{docket}</Slug>
    </div>
    <div
      style={{
        position: "absolute",
        left: PAGE.colLeft,
        top: PAGE.headRuleY,
        width: PAGE.colWidth,
        height: 6,
        backgroundColor: paper.ink,
      }}
    />
    <div
      style={{
        position: "absolute",
        left: PAGE.colLeft,
        top: PAGE.headHairY + 8,
        width: PAGE.colWidth,
        height: 2,
        backgroundColor: paper.rule,
      }}
    />

    {footer ? (
      <>
        <div
          style={{
            position: "absolute",
            left: PAGE.colLeft,
            top: PAGE.footRuleY,
            width: PAGE.colWidth,
            height: 2,
            backgroundColor: paper.rule,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: PAGE.colLeft,
            top: PAGE.footRuleY - 56,
            width: PAGE.colWidth,
            display: "flex",
          }}
        >
          <Slug>{footerLeft}</Slug>
          <div style={{ flex: 1 }} />
          <Slug tone="ink2">{footerRight}</Slug>
        </div>
      </>
    ) : null}

    {children}
  </AbsoluteFill>
);

// ---------------------------------------------------------------------------
// TextBlock — label / headline / detail stacked with the house spacing and stagger.
// Exists so no scene file re-decides the gap between a label and its claim.
// `at` is the frame the block starts; the three lines wipe on 0f / 5f / 13f after it.
// ---------------------------------------------------------------------------
export const TextBlock: React.FC<{
  label?: React.ReactNode;
  headline?: React.ReactNode;
  detail?: React.ReactNode;
  at?: number;
  /** Headline size; see TYPE and docs/type-scale.md. */
  size?: number;
  headlineTone?: Tone;
  /** Hairline between headline and detail. On by default when both are present. */
  divider?: boolean;
  /** Top of the block in composition space. */
  top?: number;
  left?: number;
  width?: number;
  style?: React.CSSProperties;
}> = ({
  label,
  headline,
  detail,
  at,
  size = TYPE.headlineSize,
  headlineTone = "ink",
  divider,
  top = PAGE.bodyTop + 160,
  left = PAGE.colLeft,
  width = PAGE.colWidth,
  style,
}) => {
  const off = (d: number) => (at === undefined ? undefined : at + d);
  const showDivider = divider ?? Boolean(headline && detail);
  return (
    <div
      style={{
        position: "absolute",
        left,
        top: top - 30,
        width,
        // Knockout: the block clears the body ruling behind it, the way a pasted-up block
        // clears the stock. Nothing is ever ruled through.
        backgroundColor: paper.bg,
        paddingTop: 30,
        paddingBottom: 30,
        ...style,
      }}
    >
      {label ? (
        <Label at={off(0)} style={{ marginBottom: 30 }}>
          {label}
        </Label>
      ) : null}
      {headline ? (
        <Headline at={off(5)} size={size} tone={headlineTone}>
          {headline}
        </Headline>
      ) : null}
      {showDivider ? (
        <Rule
          at={off(11)}
          width={184}
          thickness={3}
          color={paper.ink}
          style={{ marginTop: 34, marginBottom: 32 }}
        />
      ) : null}
      {detail ? <Detail at={off(13)}>{detail}</Detail> : null}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stamp — the red verdict impression.
//
// Round 2 failed because the ring was centred between two lines of type and bisected both,
// which reads as a biro loop drawn round the words. So: this is a rectangular impression,
// rotated, with its own interior, and it is positioned BESIDE or BELOW the type by the
// caller. Never centre it on a word. It multiplies into the paper like ink and takes a
// deterministic ink-break so it reads as pressed, not drawn.
// ---------------------------------------------------------------------------
export const Stamp: React.FC<{
  children: React.ReactNode;
  /** Frame the press lands. Omit for fully settled. */
  at?: number;
  rotate?: number;
  size?: number;
  seed?: string;
  style?: React.CSSProperties;
}> = ({ children, at, rotate = -8, size = 72, seed = "stamp", style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = at === undefined ? 1 : springAt(frame, fps, at, FIRM);
  // A stamp lands; it does not fade. Ink appears over two frames, the press settles over ~0.3s.
  const opacity =
    at === undefined
      ? 1
      : interpolate(frame - at, [0, 2], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
  const press = 1 + 0.2 * (1 - p);
  return (
    <div
      style={{
        position: "absolute",
        transform: `rotate(${rotate}deg) scale(${press})`,
        transformOrigin: "center center",
        opacity: opacity * 0.92,
        mixBlendMode: "multiply",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          border: `${Math.round(size * 0.1)}px solid ${paper.accent}`,
          padding: `${Math.round(size * 0.28)}px ${Math.round(size * 0.5)}px`,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: Math.round(size * 0.12),
            border: `${Math.max(2, Math.round(size * 0.04))}px solid ${paper.accent}`,
          }}
        />
        <div
          style={{
            fontFamily: serif,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: paper.accent,
            whiteSpace: "nowrap",
          }}
        >
          {children}
        </div>
        {/* ink-break: deterministic paper-coloured slivers, static for the whole hold */}
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${random(`${seed}-x${i}`) * 78}%`,
              top: `${8 + random(`${seed}-y${i}`) * 78}%`,
              width: `${10 + random(`${seed}-w${i}`) * 26}%`,
              height: Math.max(2, Math.round(size * 0.05)),
              backgroundColor: paper.bg,
              transform: `rotate(${-7 + random(`${seed}-r${i}`) * 14}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
