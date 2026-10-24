// Deliberation — beats 24-31. See docs/shotlist.md §3 rows 24-31 and §2.4.
//
// The tension drop: the three exhibits collapse into three ticks, a measuring axis draws down
// the frame, and one number — the cat's near point of accommodation — scrubs up and hard-stops
// on 25 CM. The mug glyph is the readout: it is BLURRED while the number is below the near
// point and snaps sharp on the exact frame the counter lands. The act windows a few frames past
// beat 32 so it can clear itself on one upward wipe into the Verdict.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beat } from "../beats";
import { FIRM, maskReveal, slam, springAt, sumSprings } from "../motion";
import { Eye, MUG_BODY, MUG_HANDLE, MUG_VIEWBOX, Paw } from "../glyphs";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";

export const FROM_BEAT = 24;
export const TO_BEAT = 31;

/** Frames the act keeps rendering past its last beat, to drive the beat-32 upward wipe. */
const WIPE_FRAMES = 22;

// --- measuring axis -------------------------------------------------------
const MX = 190; // axis x
const Y_TOP = 320;
const Y_BOT = 1470;
const SPAN = Y_BOT - Y_TOP;
const CM_MAX = 50;
const cmY = (cm: number) => Y_TOP + (cm / CM_MAX) * SPAN;

const NEAR_LO = 25;
const NEAR_HI = 36;

const MUG_PX = 220; // mug glyph box
const MUG_SCALE = MUG_PX / 200;

/** Shared typewriter: text arrives character by character, never by opacity. */
export const typeOn = (s: string, frame: number, at: number, dur: number) => {
  const n = Math.round(
    interpolate(frame, [at, at + dur], [0, s.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  return { text: s.slice(0, n), caret: frame >= at && n < s.length };
};

export const Caret: React.FC<{ size: number }> = ({ size }) => (
  <span
    style={{
      display: "inline-block",
      width: size * 0.52,
      height: size * 0.76,
      marginLeft: size * 0.1,
      backgroundColor: palette.gold,
      verticalAlign: "-0.08em",
    }}
  />
);

/** The three exhibits, collapsing into three gold ticks on beat 24. */
// Start as a ROW, inside the frame, above the right-hand counter column.
// Round 3 caught the earlier geometry mid-shrink at beat 24: three 300px gold slabs scattered
// asymmetrically, the third spanning x 820->1120 (clipped by the 1080 frame edge) and colliding
// with the counter. Keep every `from` box inside x<1080 and clear of the column at y>=690.
const EXHIBIT_TICKS = [
  {
    from: { x: 200, y: 420, w: 170, h: 170 },
    to: { x: 700, y: 206, w: 56, h: 10 },
  },
  {
    from: { x: 455, y: 420, w: 170, h: 170 },
    to: { x: 776, y: 206, w: 56, h: 10 },
  },
  {
    from: { x: 710, y: 420, w: 170, h: 170 },
    to: { x: 852, y: 206, w: 56, h: 10 },
  },
];

/** Right-hand column. Everything in it is right-aligned to SAFE.right. */
const COL: React.CSSProperties = {
  position: "absolute",
  right: 160,
  textAlign: "right",
  whiteSpace: "nowrap",
};

export const Deliberation: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat(FROM_BEAT) || frame > beat(TO_BEAT + 1) + WIPE_FRAMES) {
    return null;
  }

  // --- beat 24: exhibits shrink to ticks, panel fill drops to background ---
  const collapse = springAt(frame, fps, beat(24), FIRM);
  const panelFill = interpolateColors(
    collapse,
    [0, 1],
    [palette.panel, palette.background],
  );

  // --- beat 25: the measuring line draws from the top ----------------------
  const axisP = interpolate(frame, [beat(25), beat(25) + 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const axisBottom = Y_TOP + SPAN * axisP;

  // --- beats 26-28: the counter --------------------------------------------
  const landAt = beat(28);
  const landed = frame >= landAt;
  const raw = interpolate(frame, [beat(26), landAt], [0, NEAR_LO], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  // Hard stop with a 2-frame mechanical overshoot: the drum goes two past, then back.
  const value = landed
    ? frame < landAt + 2
      ? NEAR_LO + 2
      : NEAR_LO
    : Math.floor(raw);
  const landPunch = 1 + 0.12 * (1 - springAt(frame, fps, landAt, FIRM));

  // The mug is the readout: soft while below the near point, snaps sharp on the landing frame.
  // Beat 30 pushes it back inside 25 cm and it goes soft again.
  const insideAgain = springAt(frame, fps, beat(30) + 4, FIRM);
  const mugCm = landed
    ? NEAR_LO + (10 - NEAR_LO) * insideAgain
    : Math.max(0.6, raw);
  const softness = landed
    ? insideAgain
    : interpolate(raw, [0, NEAR_LO], [1, 0.28], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      });
  const mugBlur = 10 * softness;
  const mugFill = interpolateColors(
    softness,
    [0, 1],
    [palette.textPrimary, palette.textMuted],
  );

  // --- beat 27: measure ticks snap in every 5 cm ---------------------------
  const tickMarks = [];
  for (let cm = 5; cm <= CM_MAX; cm += 5) {
    const i = cm / 5 - 1;
    const p = springAt(frame, fps, beat(27) + i * 1.5, FIRM);
    tickMarks.push({ cm, p });
  }

  // --- beat 29: bracket 25 -> 36, range opens, label reveals ---------------
  const bracketP = interpolate(frame, [beat(29), beat(29) + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const rangeReveal = maskReveal(frame, fps, beat(29) + 6, 12);
  const cmReveal = maskReveal(frame, fps, landAt + 2, 8);
  const labelReveal = maskReveal(frame, fps, beat(29) + 10, 16);

  // --- beat 30: gold hatch fills the zone inside 25 cm ---------------------
  const hatchTop = Y_TOP;
  const hatchH = cmY(NEAR_LO) - hatchTop;
  const hatchX = 72;
  const hatchW = 246;
  const hatchLen = hatchH * Math.SQRT2; // each hatch line is a 45° run across the zone
  // Two lines so the copy clears the 360px budget (docs/type-scale.md) inside the right column.
  const cap1 = typeOn("ANY CLOSER", frame, beat(30) + 8, 13);
  const cap2 = typeOn("IS BLUR", frame, beat(30) + 21, 9);

  // --- beat 31: paw into the zone, eye closes, riser builds ----------------
  const pawIn = springAt(frame, fps, beat(31), FIRM);
  const eyeClosed = frame >= beat(31) + 8;
  const riserP = interpolate(frame, [beat(31), beat(32)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- beat 32: the whole act clears on one upward wipe --------------------
  const wipe = interpolate(frame, [beat(32), beat(32) + WIPE_FRAMES], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const numeralSize = 150;
  const numeralY = 690;

  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(0% 0% ${wipe * 100}% 0%)`,
        transform: `translateY(${-150 * wipe}px)`,
      }}
    >
      {/* the exhibit panel, its fill dropping out to background on beat 24 */}
      <div
        style={{
          position: "absolute",
          left: 72,
          top: 180,
          width: 848,
          height: 1320,
          borderRadius: 28,
          backgroundColor: panelFill,
        }}
      />

      {/* three exhibits shrinking into three gold ticks */}
      {EXHIBIT_TICKS.map((t, i) => {
        const p = springAt(frame, fps, beat(24) + i * 2, FIRM);
        const l = (a: number, b: number) => a + (b - a) * p;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: l(t.from.x, t.to.x),
              top: l(t.from.y, t.to.y),
              width: l(t.from.w, t.to.w),
              height: l(t.from.h, t.to.h),
              borderRadius: l(16, 5),
              backgroundColor: palette.gold,
            }}
          />
        );
      })}

      {/* measuring axis + ticks + bracket + hatch */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {/* the axis, drawing down from the top of frame */}
        <line
          x1={MX}
          y1={Y_TOP}
          x2={MX}
          y2={axisBottom}
          stroke={palette.textMuted}
          strokeWidth={4}
        />
        {/* gold hatch over the zone inside the near point */}
        {Array.from({ length: 20 }, (_, i) => {
          const sx = hatchX - hatchH + i * 36;
          const p = interpolate(
            frame,
            [beat(30) + i * 1.2, beat(30) + i * 1.2 + 12],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          );
          return (
            <line
              key={i}
              x1={sx}
              y1={hatchTop + hatchH}
              x2={sx + hatchH}
              y2={hatchTop}
              stroke={palette.goldDim}
              strokeWidth={6}
              strokeDasharray={hatchLen}
              strokeDashoffset={hatchLen * (1 - p)}
              clipPath="url(#delibZone)"
            />
          );
        })}
        <defs>
          <clipPath id="delibZone">
            <rect x={hatchX} y={hatchTop} width={hatchW} height={hatchH} />
          </clipPath>
        </defs>
        {/* measure ticks, every 5 cm */}
        {tickMarks.map(({ cm, p }) => (
          <line
            key={cm}
            x1={MX}
            y1={cmY(cm)}
            x2={MX + 26 * p + (cm % 25 === 0 ? 22 * p : 0)}
            y2={cmY(cm)}
            stroke={cm % 25 === 0 ? palette.gold : palette.textMuted}
            strokeWidth={cm % 25 === 0 ? 7 : 4}
          />
        ))}
        {/* the 25 -> 36 bracket */}
        <g stroke={palette.gold} strokeWidth={6} fill="none">
          <line
            x1={MX + 76}
            y1={cmY(NEAR_LO)}
            x2={MX + 76}
            y2={cmY(NEAR_LO) + (cmY(NEAR_HI) - cmY(NEAR_LO)) * bracketP}
          />
          <line
            x1={MX + 76 - 34 * bracketP}
            y1={cmY(NEAR_LO)}
            x2={MX + 76}
            y2={cmY(NEAR_LO)}
          />
          <line
            x1={MX + 76 - 34 * Math.max(0, bracketP * 2 - 1)}
            y1={cmY(NEAR_HI)}
            x2={MX + 76}
            y2={cmY(NEAR_HI)}
          />
        </g>
        {/* the riser: gold charges up the axis under beat 31 */}
        <line
          x1={MX}
          y1={Y_BOT}
          x2={MX}
          y2={Y_BOT - SPAN * riserP}
          stroke={palette.gold}
          strokeWidth={10}
        />
      </svg>

      {/* eye pinned to the top of the axis */}
      <div
        style={{
          position: "absolute",
          left: MX - 100,
          top: Y_TOP - 152,
          transform: `scale(${springAt(frame, fps, beat(25) + 10, FIRM)})`,
          transformOrigin: "50% 100%",
        }}
      >
        <Eye size={200} closed={eyeClosed} color={palette.gold} />
      </div>

      {/* the Exhibit-A paw sliding into the hatched zone */}
      <div
        style={{
          position: "absolute",
          left: MX - 100,
          top: 620,
          transform: `translateX(${(1 - pawIn) * -420}px)`,
        }}
      >
        <Paw size={200} />
      </div>

      {/* the mug: the readout. Blurred below the near point, snapping sharp on the land. */}
      <div
        style={{
          position: "absolute",
          left: MX - 95 * MUG_SCALE,
          top: cmY(mugCm) - 150 * MUG_SCALE,
          filter: `blur(${mugBlur}px)`,
          transform: `scale(${sumSprings(frame, fps, 1, [
            { at: landAt, delta: 0.16, config: FIRM },
            { at: landAt + 5, delta: -0.16, config: FIRM },
          ])})`,
          transformOrigin: "50% 100%",
        }}
      >
        <svg width={MUG_PX} height={MUG_PX} viewBox={MUG_VIEWBOX}>
          <path d={MUG_BODY} fill={mugFill} />
          <path d={MUG_HANDLE} fill={mugFill} />
        </svg>
      </div>

      {/* the number */}
      <div
        style={{
          ...COL,
          top: numeralY,
          transform: `${slam(frame, fps, beat(26)).transform} scale(${landPunch})`,
          transformOrigin: "100% 50%",
          fontFamily: serif,
          fontWeight: 900,
          fontSize: numeralSize,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          color: palette.textPrimary,
        }}
      >
        <span>{value}</span>
        {frame >= beat(29) ? (
          <span
            style={{
              display: "inline-block",
              clipPath: rangeReveal.clipPath,
              color: palette.gold,
            }}
          >
            –{NEAR_HI}
          </span>
        ) : null}
        {landed ? (
          <span
            style={{
              display: "inline-block",
              clipPath: cmReveal.clipPath,
              marginLeft: 22,
              fontSize: numeralSize * 0.56,
              color: palette.gold,
            }}
          >
            CM
          </span>
        ) : null}
      </div>

      {/* label */}
      <div
        style={{
          ...COL,
          top: numeralY + numeralSize + 26,
          clipPath: labelReveal.clipPath,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 46,
          letterSpacing: "0.1em",
          color: palette.textMuted,
        }}
      >
        NEAR POINT · 4 CATS
      </div>

      {/* consequence, typed on. Two lines so it clears 360px in the right column. */}
      <div
        style={{
          ...COL,
          top: 1192,
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 1.16,
          letterSpacing: "-0.01em",
          color: palette.gold,
        }}
      >
        <div>
          {cap1.text}
          {cap1.caret ? <Caret size={88} /> : null}
        </div>
        <div>
          {cap2.text}
          {cap2.caret ? <Caret size={88} /> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
