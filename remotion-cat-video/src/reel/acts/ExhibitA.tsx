// ExhibitA — beats 12-15. See docs/shotlist.md §3 rows 12-15 and §4 "Exhibit A".
//
// Mechanism: a STATIC square card with an ANIMATED INTERIOR. The paw underside draws itself by
// stroke-dash (outline, then the five pads), receptor dots pepper INTO the pads, and a horizontal
// frequency sweep along the card's base drives their radial pulse — faster and brighter as the
// sweep rises. The sweep stopping cues the claim slam. Nothing translates; the frame holds.
//
// FACT GUARD (docs/shotlist.md §6): 20-400 Hz is the union of two studies' TESTED ranges, not a
// physiological limit. The scale therefore has NO end ticks, caps or boundary lines — the dashed
// axis runs off both edges of the card and is cut by the card's own clip, so it reads as open.
import React from "react";
import { interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { beat } from "../beats";
import { FIRM, maskReveal, morphBox, slam, springAt } from "../motion";
import {
  PAW_OUTLINE,
  PAW_OUTLINE_LENGTH,
  PAW_PADS,
  PAW_PAD_CENTERS,
} from "../glyphs";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";

export const FROM_BEAT = 12;
export const TO_BEAT = 15;

/**
 * Centre line of the SAFE area, not of the frame. SAFE is asymmetric (the right edge carries the
 * Shorts UI), so (72 + (1080-160)) / 2 = 496 is where the optical centre actually is.
 * ExhibitB and ExhibitC import this so all three acts sit on one axis.
 */
export const CX = 496;

/** The square exhibit card. ExhibitB imports it and rotates it away on beat 16. */
export const CARD = { x: CX - 424, y: 300, w: 848, h: 1160, r: 28 } as const;

/** Paw drawing, cropped tight to the glyph's ink (PAW_VIEWBOX is mostly empty above y=70). */
const PAW_BOX = { x: CX - 410, y: 350, w: 820, h: 564 };
const PAW_VB = "20 70 160 110";

const CLAIM = "THE PAW IS A SENSOR";
const DETAIL = ["Pad receptors sharpen", "as vibration speeds up."];

/** Receptor dots per pad, laid inside the pad ellipse. Toe pads 0-3 are small, 4 is the plantar. */
const DOT_FIELD = PAW_PAD_CENTERS.map((c, i) => {
  const n = i === 4 ? 10 : 4;
  const rx = i === 4 ? 25 : 6;
  const ry = i === 4 ? 16 : 7.5;
  return Array.from({ length: n }, (_, j) => {
    // Rejection-free disc sampling: sqrt() on the radius keeps the field even, not centre-heavy.
    const a = random(`pawdot-a-${i}-${j}`) * Math.PI * 2;
    const r = Math.sqrt(random(`pawdot-r-${i}-${j}`));
    return { x: c.x + Math.cos(a) * rx * r, y: c.y + Math.sin(a) * ry * r };
  });
});
const DOT_ORDER = DOT_FIELD.flat().length;

export const ExhibitA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // ExhibitB owns the card from beat 16 onward (it rotates this exact box away).
  if (frame < beat(FROM_BEAT) || frame >= beat(16)) return null;

  // ---- beat 12: the charge panel contracts into the square card; the whole frame jolts 1 frame.
  const box = morphBox(
    frame,
    fps,
    beat(12),
    { w: 884, h: 1360, r: 24 },
    { w: CARD.w, h: CARD.h, r: CARD.r },
  );
  const jolt = frame === beat(12) ? 9 : 0;
  const cardCy = CARD.y + CARD.h / 2;

  // ---- beat 13: the paw draws itself. Outline by stroke-dash, then the five pads, one by one.
  const outlineP = interpolate(frame, [beat(13), beat(13) + 19], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ---- beat 14: the sweep. 20 Hz -> 400 Hz across one beat; it drives everything below it.
  const sweepT = Math.max(0, frame - beat(14));
  const SWEEP_LEN = 30;
  const sweep = Math.min(1, sweepT / SWEEP_LEN); // 0..1, hard-stops at 400 Hz on beat 15
  const hz = Math.round(20 + 380 * sweep);

  // Pulse phase is the INTEGRAL of the rate, so the dots speed up continuously with the sweep
  // instead of jumping each frame. Rate is linear in t, hence the t^2/2 term.
  const r0 = 0.045;
  const r1 = 0.26;
  const tc = Math.min(sweepT, SWEEP_LEN);
  const phase =
    r0 * tc + ((r1 - r0) * tc * tc) / (2 * SWEEP_LEN) + r1 * Math.max(0, sweepT - SWEEP_LEN);
  const pulse = 0.5 - 0.5 * Math.cos(Math.PI * 2 * phase);

  // ---- beat 15: claim slams over the paw, detail mask-reveals beneath it.
  const claim = slam(frame, fps, beat(15));
  const band = maskReveal(frame, fps, beat(15) - 6, 8);

  const label = "EXHIBIT A";

  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${jolt}px)` }}>
      {/* The card. One container; it contracted out of the charge panel and never cuts. */}
      <div
        style={{
          position: "absolute",
          left: CX - box.width / 2,
          top: cardCy - box.height / 2,
          width: box.width,
          height: box.height,
          borderRadius: box.borderRadius,
          backgroundColor: palette.panel,
          border: `3px solid ${palette.goldDim}`,
          overflow: "hidden",
        }}
      />

      {/* Label — ticks in letter by letter, 2 frames apart. Never a fade. */}
      <div
        style={{
          position: "absolute",
          left: CARD.x + 6,
          top: 228,
          display: "flex",
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 12,
          color: palette.gold,
        }}
      >
        {label.split("").map((ch, i) => {
          const s = springAt(frame, fps, beat(12) + i * 2, FIRM);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                width: ch === " " ? 18 : undefined,
                transform: `translateY(${(1 - s) * -22}px) scaleY(${0.3 + 0.7 * s})`,
                clipPath: `inset(0 0 ${(1 - s) * 100}% 0)`,
              }}
            >
              {ch === " " ? " " : ch}
            </span>
          );
        })}
      </div>

      {/* ---- card interior: the paw, drawn, then peppered with receptors. */}
      <svg
        width={PAW_BOX.w}
        height={PAW_BOX.h}
        viewBox={PAW_VB}
        style={{ position: "absolute", left: PAW_BOX.x, top: PAW_BOX.y }}
      >
        <path
          d={PAW_OUTLINE}
          fill="none"
          stroke={palette.gold}
          strokeWidth={3.2}
          strokeLinejoin="round"
          strokeDasharray={PAW_OUTLINE_LENGTH}
          strokeDashoffset={PAW_OUTLINE_LENGTH * (1 - outlineP)}
        />
        {PAW_PADS.map((d, i) => {
          const s = springAt(frame, fps, beat(13) + 15 + i * 3, FIRM);
          const c = PAW_PAD_CENTERS[i];
          return (
            <path
              key={i}
              d={d}
              fill={palette.goldDim}
              transform={`translate(${c.x} ${c.y}) scale(${s}) translate(${-c.x} ${-c.y})`}
            />
          );
        })}
        {DOT_FIELD.map((pad, i) =>
          pad.map((p, j) => {
            const idx = DOT_FIELD.slice(0, i).flat().length + j;
            const inAt = beat(14) + (idx / DOT_ORDER) * 16;
            const s = springAt(frame, fps, inAt, FIRM);
            // Radial pulse: amplitude and brightness both ride the sweep.
            const amp = 0.35 + 0.65 * sweep;
            const r = (1.25 + 1.9 * pulse * amp) * s;
            return (
              <circle
                key={`${i}-${j}`}
                cx={p.x}
                cy={p.y}
                r={r}
                fill={palette.gold}
                opacity={(0.3 + 0.7 * pulse * amp) * s}
              />
            );
          }),
        )}
      </svg>

      {frame >= beat(14) - 8 ? (
      <>
      {/* ---- the frequency sweep, along the card's base. Its own SVG clips the dashed axis at
            both edges, so the scale reads OPEN — no cutoff, no endpoint cap. */}
      <svg
        width={CARD.w}
        height={130}
        viewBox={`0 0 ${CARD.w} 130`}
        style={{
          position: "absolute",
          left: CARD.x,
          top: 1240,
          clipPath: `inset(0 ${(1 - Math.min(1, (frame - (beat(14) - 8)) / 10)) * 100}% 0 0)`,
        }}
      >
        <line
          x1={-60}
          y1={62}
          x2={CARD.w + 60}
          y2={62}
          stroke={palette.goldDim}
          strokeWidth={3}
          strokeDasharray="9 12"
          strokeDashoffset={frame % 16}
        />
        {frame >= beat(14) ? (
          <>
            <line
              x1={60 + sweep * (CARD.w - 140)}
              y1={44}
              x2={60 + sweep * (CARD.w - 140)}
              y2={80}
              stroke={palette.gold}
              strokeWidth={6}
            />
            <text
              x={60 + sweep * (CARD.w - 140)}
              y={30}
              textAnchor="middle"
              fontFamily={sans}
              fontWeight={600}
              fontSize={32}
              fill={palette.gold}
            >
              {hz} Hz
            </text>
            <text
              x={CARD.w / 2}
              y={120}
              textAnchor="middle"
              fontFamily={sans}
              fontWeight={500}
              fontSize={34}
              letterSpacing={4}
              fill={palette.textMuted}
              clipPath={`inset(0 ${(1 - Math.min(1, sweepT / 10)) * 100}% 0 0)`}
            >
              20 Hz &#8594; 400 Hz
            </text>
          </>
        ) : null}
      </svg>
      </>
      ) : null}

      {/* ---- beat 15: claim slams OVER the paw on a flat record band; detail reveals beneath. */}
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: 950,
          width: CARD.w,
          height: 136,
          backgroundColor: palette.background,
          clipPath: band.clipPath,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: CARD.x,
          top: 950,
          width: CARD.w,
          height: 136,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 64,
          letterSpacing: 1,
          color: palette.textPrimary,
          transform: claim.transform,
          clipPath: `inset(0 0 ${(1 - claim.p) * 100}% 0)`,
        }}
      >
        {CLAIM}
      </div>
      {DETAIL.map((line, i) => {
        const m = maskReveal(frame, fps, beat(15) + 7 + i * 5, 11);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CARD.x,
              top: 1116 + i * 50,
              width: CARD.w,
              textAlign: "center",
              fontFamily: sans,
              fontWeight: 400,
              fontSize: 38,
              color: palette.textMuted,
              clipPath: m.clipPath,
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};
