// ExhibitC — beats 20-23. See docs/shotlist.md §3 rows 20-23 and §4 "Exhibit C".
//
// Mechanism: a PHYSICAL EXPERIMENT whose PREDICTION IS DRAWN FIRST. ExhibitB's compressed bar
// extrudes upward into an opaque lidded box. The box shakes on the off-eighths, emitting three
// gold sound arcs per shake (the rattle). It then rotates a full 180 degrees about its own base.
// Critically the dashed predicted arc draws itself AHEAD of the object; only then does the object
// drop out along it and land on the predicted endpoint, where the dash solidifies to a hairline.
// Volumetric and vertical — it shares no layout, axis or reveal with A (static card) or B (track).
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { beat } from "../beats";
import { FIRM, maskReveal, slam, springAt } from "../motion";
import { SOUND_ARC_LENGTH, SOUND_ARC_PATH } from "../glyphs";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";
import { CX } from "./ExhibitA";
import { BAR } from "./ExhibitB";

export const FROM_BEAT = 20;
export const TO_BEAT = 23;

/** The box stands ON the bar: its base is the bar's bottom edge. */
const BASE_Y = BAR.cy + BAR.h / 2;
const BOX = { w: 460, h: 460 };
const BOX_CY = BASE_Y - BOX.h / 2;

/** The predicted path: mouth of the inverted box -> landing point. Quadratic, one control point. */
const P0 = { x: CX, y: BASE_Y + BOX.h };
const P1 = { x: CX + 160, y: BASE_Y + BOX.h + 60 };
const P2 = { x: CX + 240, y: BASE_Y + BOX.h + 120 };
const qAt = (t: number) => ({
  x: (1 - t) ** 2 * P0.x + 2 * (1 - t) * t * P1.x + t ** 2 * P2.x,
  y: (1 - t) ** 2 * P0.y + 2 * (1 - t) * t * P1.y + t ** 2 * P2.y,
});
const ARC_D = `M${P0.x} ${P0.y} Q${P1.x} ${P1.y} ${P2.x} ${P2.y}`;

/** Three shakes on the off-eighths of beat 21 (an eighth is 15 frames at 120 BPM / 60 fps). */
const SHAKES = [beat(21) + 7, beat(21) + 15, beat(21) + 22];

const CLAIM = "CATS PREDICT THE DROP";
const DETAIL = ["A rattle makes a cat", "expect something to fall."];

const ARC_DRAW_AT = beat(22) + 2;
const ARC_DRAW_LEN = 16;
const DROP_AT = beat(22) + 18;

export const ExhibitC: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat(FROM_BEAT) || frame > beat(TO_BEAT + 1)) return null;

  // ---- beat 20: the bar extrudes upward into the box.
  const grow = springAt(frame, fps, beat(20), FIRM);
  const boxW = BAR.w + (BOX.w - BAR.w) * grow;
  const boxH = BAR.h + (BOX.h - BAR.h) * grow;

  // ---- beat 21: the rattle. Shake is a decaying sine burst; pure function of frame.
  let shakeX = 0;
  let shakeR = 0;
  for (const t of SHAKES) {
    const d = frame - t;
    if (d >= 0 && d < 10) {
      const env = (1 - d / 10) ** 2;
      const s = Math.sin((d / 10) * Math.PI * 3);
      shakeX += 16 * env * s;
      shakeR += 2.6 * env * s;
    }
  }

  // ---- beat 22: the box rotates 180 degrees about its own base.
  const flip = springAt(frame, fps, beat(22), FIRM);

  // The prediction is drawn FIRST, then the object follows it out.
  const drawn = interpolate(frame, [ARC_DRAW_AT, ARC_DRAW_AT + ARC_DRAW_LEN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fall = interpolate(frame, [DROP_AT, beat(23)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Gravity, not an ease: the object accelerates down the path it was promised.
  const obj = qAt(fall * fall);
  const landed = frame >= beat(23);

  const claim = slam(frame, fps, beat(23));

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* Label ticks over from B. */}
      <div
        style={{
          position: "absolute",
          left: CX - 424,
          top: 220,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 12,
          color: palette.gold,
          transform: `scaleX(${springAt(frame, fps, beat(20), FIRM)})`,
          transformOrigin: "left center",
        }}
      >
        EXHIBIT C
      </div>

      {/* The predicted arc. Dashed while it is only a prediction; a solid hairline once the
          object has landed on its endpoint. */}
      {/* A dashed line cannot draw itself by dash-offset (the offset IS the dash), so the
          reveal is a left-to-right wipe — x is monotonic along this curve. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          clipPath: `inset(0 ${(1 - drawn) * (1080 - P0.x)}px 0 0)`,
        }}
      >
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path
            d={ARC_D}
            fill="none"
            stroke={landed ? palette.gold : palette.goldDim}
            strokeWidth={landed ? 3 : 4}
            strokeDasharray={landed ? undefined : "12 14"}
          />
          {/* Prediction endpoint, drawn with the arc — before anything arrives there. */}
          {drawn > 0.88 ? (
            <line
              x1={P2.x - 34}
              y1={P2.y}
              x2={P2.x + 34}
              y2={P2.y}
              stroke={palette.gold}
              strokeWidth={4}
            />
          ) : null}
        </svg>
      </div>

      {/* The object, en route down its own prediction. */}
      {frame >= DROP_AT ? (
        <div
          style={{
            position: "absolute",
            left: obj.x - 34,
            top: obj.y - 34,
            width: 68,
            height: 68,
            borderRadius: 34,
            backgroundColor: palette.gold,
            transform: `scaleY(${landed ? 0.86 : 1}) scaleX(${landed ? 1.1 : 1})`,
            transformOrigin: "center bottom",
          }}
        />
      ) : null}

      {/* The box. Rotates about its own base, so the lid ends up underneath. */}
      <div
        style={{
          position: "absolute",
          left: CX - boxW / 2,
          top: BASE_Y - boxH,
          width: boxW,
          height: boxH,
          backgroundColor: palette.panel,
          border: `3px solid ${palette.gold}`,
          borderRadius: 6,
          transformOrigin: "center bottom",
          transform: `translateX(${shakeX}px) rotate(${180 * flip + shakeR}deg)`,
          overflow: "hidden",
        }}
      >
        {/* lid seam */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 68 * grow,
            width: "100%",
            height: 5,
            backgroundColor: palette.gold,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: "100%",
            height: 68 * grow,
            backgroundColor: palette.goldDim,
          }}
        />
      </div>

      {/* Three sound arcs per shake, pulsing outward both sides. Drawn in and drawn out by
          dash offset — nothing fades. */}
      {SHAKES.map((t) =>
        [0, 1, 2].map((k) => {
          const p = (frame - t - k * 3) / 14;
          if (p <= 0 || p >= 1) return null;
          const off = SOUND_ARC_LENGTH * (1 - 2 * p);
          const spread = 30 + k * 54;
          return [1, -1].map((dir) => (
            <svg
              key={`${t}-${k}-${dir}`}
              width={110}
              height={165}
              viewBox="0 0 80 120"
              style={{
                position: "absolute",
                left: CX + dir * (BOX.w / 2 + spread) - 55 + shakeX,
                top: BOX_CY - 82,
                transform: `scaleX(${dir})`,
              }}
            >
              <path
                d={SOUND_ARC_PATH}
                fill="none"
                stroke={palette.gold}
                strokeWidth={7}
                strokeLinecap="round"
                strokeDasharray={`${SOUND_ARC_LENGTH} ${SOUND_ARC_LENGTH}`}
                strokeDashoffset={off}
              />
            </svg>
          ));
        }),
      )}

      {/* ---- beat 23: claim slams ABOVE the experiment (A claims over its card, B below its bar). */}
      <div
        style={{
          position: "absolute",
          left: CX - 424,
          top: 310,
          width: 848,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 60,
          whiteSpace: "nowrap",
          color: palette.textPrimary,
          transform: claim.transform,
          clipPath: `inset(0 0 ${(1 - claim.p) * 100}% 0)`,
        }}
      >
        {CLAIM}
      </div>
      {DETAIL.map((line, i) => {
        const m = maskReveal(frame, fps, beat(23) + 7 + i * 5, 11);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: CX - 424,
              top: 430 + i * 50,
              width: 848,
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
