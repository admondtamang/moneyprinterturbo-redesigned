// Lockup — beats 40-43. See docs/shotlist.md §3 rows 40-43, §2.6 and §5 (the loop note).
//
// This act owns the loop point. Beat 42 runs the opening in reverse behind the clearing
// lockup: the frame-0 table edge draws back in and the seven mug fragments reassemble onto it.
// By the last frame the hairline has closed, the mug is whole at STAGE.mugRest and the paw is
// entering frame-right at EXACTLY its frame-0 position and velocity — both driven by pawX()
// and LOOP_PAW_PX_PER_FRAME from stage.ts, which the Hook act uses too. Nothing here may
// hardcode a stage coordinate.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beat, TOTAL_FRAMES } from "../beats";
import { FIRM, maskReveal, springAt } from "../motion";
import {
  MUG_BODY,
  MUG_FRAGMENTS,
  MUG_HANDLE,
  MUG_VIEWBOX,
  PawSilhouette,
} from "../glyphs";
import { LOOP_PAW_PX_PER_FRAME, pawX, STAGE, TABLE_STROKE } from "../stage";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";
import { Caret, typeOn } from "./Deliberation";
import { TABLEAU } from "./Hook";

export const FROM_BEAT = 40;
export const TO_BEAT = 43;

/** The gold hairline the lockup draws from, and that everything compresses back into. */
const HAIRLINE_Y = 820;
const HAIRLINE_HALF = 380;

const LOCKUP_Y = 620;
const CASE_Y = 858;
const NEXT_Y = 936;

/**
 * Mug glyph box. The glyph's base sits at 150/200 of the box and its centre at 95/200.
 * TABLEAU comes from Hook, which exports it precisely so both acts draw the frame-0 tableau at
 * the same magnification — an unscaled STAGE.mugSize mug is debris at 360px. Loop contract.
 */
const MUG_K = (STAGE.mugSize / 200) * TABLEAU;
const MUG_PX = 200 * MUG_K;
const MUG_LEFT = STAGE.mugRest.x - 95 * MUG_K;
const MUG_TOP = STAGE.mugRest.y - 150 * MUG_K;

/**
 * Loop contract. The paw travels left at a constant LOOP_PAW_PX_PER_FRAME; the Hook enters it
 * PAW_ENTRY frames "early" so it is already at STAGE.pawContact on frame 0. Running the same
 * helper offset by the film length puts frame 1319 exactly one frame before the Hook's frame 0 —
 * same position, same velocity, so frame 1320 IS frame 0 and the strike reads as continuous.
 */
const PAW_ENTRY =
  (STAGE.pawOffstage.x - STAGE.pawContact.x) / LOOP_PAW_PX_PER_FRAME;

const centred: React.CSSProperties = {
  position: "absolute",
  left: 0,
  width: 1080,
  textAlign: "center",
  whiteSpace: "nowrap",
};

export const Lockup: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat(FROM_BEAT)) return null;

  // --- beat 40: lockup mask-reveals, hairline draws outward both ways -----
  const nameReveal = maskReveal(frame, fps, beat(40) + 2, 16);
  const drawn = springAt(frame, fps, beat(40), FIRM);
  // --- beat 43: the hairline closes to nothing ----------------------------
  const closed = interpolate(frame, [beat(43), beat(43) + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const halfW = HAIRLINE_HALF * drawn * (1 - closed);

  // --- beat 41: the next-case lines type on -------------------------------
  const caseLine = typeOn("CASE 02", frame, beat(41), 12);
  const nextLine = typeOn("THE 4 A.M. SPRINT", frame, beat(41) + 10, 20);

  // --- beat 42: lockup and text compress into the hairline -----------------
  const compress = springAt(frame, fps, beat(42), FIRM);

  // --- beat 42: behind it, frame 0 draws back in ---------------------------
  const edgeP = interpolate(frame, [beat(42) + 4, beat(42) + 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const whole = frame >= beat(43);

  // --- the loop contract ---------------------------------------------------
  const pawLeft = pawX(frame + PAW_ENTRY - TOTAL_FRAMES);

  return (
    <AbsoluteFill>
      {/* --- frame 0 rebuilding behind the hairline --------------------- */}
      <svg
        width={1080}
        height={1920}
        viewBox="0 0 1080 1920"
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        <line
          x1={0}
          y1={STAGE.tableY}
          x2={STAGE.tableEdgeX * edgeP}
          y2={STAGE.tableY}
          stroke={palette.textMuted}
          strokeWidth={TABLE_STROKE}
        />
      </svg>

      {/* the seven fragments reassembling into the mug at STAGE.mugRest */}
      {frame >= beat(42) ? (
      <div style={{ position: "absolute", left: MUG_LEFT, top: MUG_TOP }}>
        <svg
          width={MUG_PX}
          height={MUG_PX}
          viewBox={MUG_VIEWBOX}
          style={{ overflow: "visible" }}
        >
          {whole ? (
            <>
              <path d={MUG_BODY} fill={palette.textPrimary} />
              <path d={MUG_HANDLE} fill={palette.textPrimary} />
            </>
          ) : (
            MUG_FRAGMENTS.map((d, i) => {
              const p = springAt(frame, fps, beat(42) + i * 2, FIRM);
              const q = 1 - p;
              const dx = (random(`lx${i}`) - 0.5) * 520 * q;
              const dy = (random(`ly${i}`) * 0.8 + 0.4) * 620 * q;
              const rot = (random(`lr${i}`) - 0.5) * 110 * q;
              return (
                <path
                  key={i}
                  d={d}
                  fill={palette.textPrimary}
                  transform={`translate(${dx} ${dy}) rotate(${rot} 95 105)`}
                />
              );
            })
          )}
        </svg>
      </div>
      ) : null}

      {/* the paw entering frame-right — position AND velocity match frame 0 */}
      <PawSilhouette
        size={STAGE.pawSize}
        style={{
          position: "absolute",
          left: pawLeft,
          top: STAGE.pawOffstage.y,
        }}
      />

      {/* --- the lockup itself, compressing into the hairline on beat 42 --- */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scaleY(${Math.max(0, 1 - compress)})`,
          transformOrigin: `50% ${HAIRLINE_Y}px`,
        }}
      >
        <div
          style={{
            ...centred,
            top: LOCKUP_Y,
            clipPath: nameReveal.clipPath,
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 128,
            letterSpacing: "-0.02em",
            color: palette.textPrimary,
          }}
        >
          thecatcourt
        </div>

        <div
          style={{
            ...centred,
            top: CASE_Y,
            fontFamily: sans,
            fontWeight: 500,
            fontSize: 44,
            letterSpacing: "0.34em",
            color: palette.textMuted,
          }}
        >
          {caseLine.text}
          {caseLine.caret ? <Caret size={44} /> : null}
        </div>

        <div
          style={{
            ...centred,
            top: NEXT_Y,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 76,
            letterSpacing: "0.01em",
            color: palette.gold,
          }}
        >
          {nextLine.text}
          {nextLine.caret ? <Caret size={76} /> : null}
        </div>
      </div>

      {/* the gold hairline: draws outward from centre, closes to nothing on beat 43 */}
      <div
        style={{
          position: "absolute",
          left: 540 - halfW,
          top: HAIRLINE_Y,
          width: halfW * 2,
          height: 5,
          backgroundColor: palette.gold,
        }}
      />
    </AbsoluteFill>
  );
};
