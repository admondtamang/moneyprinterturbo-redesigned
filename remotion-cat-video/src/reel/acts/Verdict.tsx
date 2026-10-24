// Verdict — beats 32-39. See docs/shotlist.md §3 rows 32-39 and §2.5.
//
// The climax. Beat 35 carries VERDICT_STAMP_BEAT, the loudest single hit in the film, so the
// type recoils on exactly that frame. Beats 36-38 are deliberate follow-through, not a hold on
// NOT GUILTY: 36 strikes the charge out, 37 types the dismissal, 38 flips the three exhibit
// ticks to struck rules. Beat 39 docks the block up and 40 compresses it into the Lockup
// hairline, which is why the act windows past its last beat.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beat } from "../beats";
import {
  FIRM,
  maskReveal,
  morphBox,
  slam,
  springAt,
  sumSprings,
} from "../motion";
import { VERDICT_STAMP_BEAT } from "../sfx";
import { palette } from "../../facts/palette";
import { serif } from "../../facts/fonts";
import { Caret, typeOn } from "./Deliberation";

export const FROM_BEAT = 32;
export const TO_BEAT = 39;

/** Frames past beat 39 the act keeps rendering, to compress into the Lockup hairline. */
const HANDOFF_FRAMES = 18;

/** y the Lockup's gold hairline occupies — everything collapses onto it on beat 40. */
const HAIRLINE_Y = 820;

const STAMP_BEAT = VERDICT_STAMP_BEAT;
/** Diameter of the ink impression. Small and offset — see the stamp block below. */
const STAMP_D = 395;
/** Impression centre, in the verdict block's own space. Deliberately NOT between the two
 *  words: at y=855 (midway between NOT at 700 and GUILTY at 1010) a ring bisects both of
 *  them, which is what made round 2 read as a biro loop drawn round the words. */
const STAMP_CX = 888;
const STAMP_CY = 540;

const CHARGE_Y = 430;
const NOT_Y = 700;
const GUILTY_Y = 1010;
const DISMISS_Y = 1232;
const TICKS_Y = 1412;

const centred: React.CSSProperties = {
  position: "absolute",
  left: 0,
  width: 1080,
  textAlign: "center",
  whiteSpace: "nowrap",
};

export const Verdict: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat(FROM_BEAT) || frame > beat(40) + HANDOFF_FRAMES) return null;

  // --- beat 32: empty panel opens to full frame ---------------------------
  const panel = morphBox(
    frame,
    fps,
    beat(32),
    { w: 760, h: 520, r: 36 },
    { w: 1080, h: 1920, r: 0 },
  );

  // --- beats 33-34: the two slams, settling as one block ------------------
  const notS = slam(frame, fps, beat(33));
  const guiltyS = slam(frame, fps, beat(34));
  // The block's own 2-frame overshoot as the two words become one object.
  const settle = sumSprings(frame, fps, 0, [
    { at: beat(34) + 2, delta: -16, config: FIRM },
    { at: beat(34) + 4, delta: 16, config: FIRM },
  ]);

  // --- beat 35: the stamp lands on this exact frame; type recoils 1 frame --
  const stampLand = beat(STAMP_BEAT);
  const stampIn = interpolate(frame, [stampLand - 13, stampLand], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const stampRot = -26 + 15 * stampIn; // rotates in, lands at -11°
  const stampScale = 1.55 - 0.55 * stampIn;
  const recoil = frame === stampLand ? 14 : 0;
  const recoilScale = frame === stampLand ? 0.974 : 1;

  // --- beat 36: the charge reappears small and is ruled straight through ---
  const chargeReveal = maskReveal(frame, fps, beat(36), 10);
  const ruleP = interpolate(frame, [beat(36) + 8, beat(36) + 24], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // --- beat 37: the dismissal types on ------------------------------------
  const dismiss = typeOn("CHARGE DISMISSED", frame, beat(37), 22);

  // --- beat 38: three exhibit ticks re-enter and flip to struck rules ------
  const tickXs = [320, 540, 760];

  // --- beat 39: block scales down and docks to the upper third ------------
  const dock = springAt(frame, fps, beat(39), FIRM);
  // --- beat 40: everything compresses onto the Lockup hairline ------------
  const out = interpolate(frame, [beat(40), beat(40) + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        transform: `scaleY(${Math.max(0, 1 - out)})`,
        transformOrigin: `50% ${HAIRLINE_Y}px`,
      }}
    >
      {/* the panel, held open at full frame */}
      <div
        style={{
          position: "absolute",
          left: (1080 - panel.width) / 2,
          top: (1920 - panel.height) / 2,
          width: panel.width,
          height: panel.height,
          borderRadius: panel.borderRadius,
          backgroundColor: palette.panel,
        }}
      />

      {/* the verdict block: charge line + NOT + GUILTY + stamp, docking as one */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1080,
          height: 1920,
          transform: `translateY(${settle + recoil - 236 * dock}px) scale(${
            (1 - 0.44 * dock) * recoilScale
          })`,
          transformOrigin: "50% 760px",
        }}
      >
        {/* struck-through charge line */}
        <div
          style={{
            ...centred,
            top: CHARGE_Y,
            clipPath: chargeReveal.clipPath,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 56,
            letterSpacing: "0.1em",
            color: palette.textMuted,
          }}
        >
          WILFUL DISPLACEMENT
        </div>
        <div
          style={{
            position: "absolute",
            left: 196,
            top: CHARGE_Y + 34,
            width: 690 * ruleP,
            height: 7,
            backgroundColor: palette.gold,
          }}
        />

        {/* NOT — the largest type in the film, cropped by both frame edges */}
        <div
          style={{
            ...centred,
            top: NOT_Y,
            transform: `translateY(-50%) ${notS.transform}`,
            clipPath: `inset(${(1 - notS.p) * 52}% 0% 0% 0%)`,
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 470,
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: palette.textPrimary,
          }}
        >
          NOT
        </div>

        {/* GUILTY */}
        <div
          style={{
            ...centred,
            top: GUILTY_Y,
            transform: `translateY(-50%) ${guiltyS.transform}`,
            clipPath: `inset(${(1 - guiltyS.p) * 52}% 0% 0% 0%)`,
            fontFamily: serif,
            fontWeight: 900,
            fontSize: 250,
            lineHeight: 1,
            letterSpacing: "-0.045em",
            color: palette.textPrimary,
          }}
        >
          GUILTY
        </div>

        {/* The stamp ring, landing over the type on beat 35. Gated on its entry:
            rendered from beat 32 it sat on screen at 26°/1.62x and read as a stray
            scribbled loop across NOT GUILTY on the 360px strip. */}
        {frame >= stampLand - 13 ? (
          <div
            style={{
              position: "absolute",
              left: STAMP_CX - STAMP_D / 2,
              top: STAMP_CY - STAMP_D / 2,
              width: STAMP_D,
              height: STAMP_D,
              transform: `rotate(${stampRot}deg) scale(${stampScale})`,
              transformOrigin: "50% 50%",
            }}
          >
            {/* One pressed impression, not concentric loops. The dash pattern is uneven ink
                take-up: a rubber stamp never lays a continuous line. Breaks are hand-placed
                (not random) so the frame stays pure and the gaps fall off the type. */}
            <svg viewBox="0 0 200 200" width={STAMP_D} height={STAMP_D}>
              <circle
                cx={100}
                cy={100}
                r={86}
                fill="none"
                stroke={palette.gold}
                strokeWidth={13}
                strokeLinecap="round"
                strokeDasharray="164 9 112 7 141 6 86"
                strokeDashoffset={22}
              />
            </svg>
          </div>
        ) : null}
      </div>

      {/* follow-through that clears the lower frame on beat 39 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${640 * dock}px)`,
        }}
      >
        <div
          style={{
            ...centred,
            top: DISMISS_Y,
            fontFamily: serif,
            fontWeight: 700,
            fontSize: 96,
            letterSpacing: "0.02em",
            color: palette.gold,
          }}
        >
          {dismiss.text}
          {dismiss.caret ? <Caret size={96} /> : null}
        </div>

        {/* three exhibit ticks flipping to struck-through rules, 8 frames apart */}
        {tickXs.map((x, i) => {
          const at = beat(38) + i * 8;
          const enter = springAt(frame, fps, at, FIRM);
          const flip = interpolate(frame, [at + 6, at + 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const struck = flip > 0.5;
          if (frame < at) return null;
          const strike = interpolate(flip, [0.5, 1], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={x}
              style={{
                position: "absolute",
                left: x,
                top: TICKS_Y,
                width: 140,
                height: 44,
                transform: `translateY(${(1 - enter) * 90}px) scaleY(${Math.max(
                  0.04,
                  Math.abs(Math.cos(flip * Math.PI)),
                )})`,
              }}
            >
              {struck ? (
                <>
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 18,
                      width: 140,
                      height: 7,
                      backgroundColor: palette.textMuted,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 18,
                      width: 140 * strike,
                      height: 7,
                      backgroundColor: palette.gold,
                      transform: "rotate(-9deg)",
                      transformOrigin: "0% 50%",
                    }}
                  />
                </>
              ) : (
                <div
                  style={{
                    position: "absolute",
                    left: 42,
                    top: 16,
                    width: 56,
                    height: 11,
                    borderRadius: 5,
                    backgroundColor: palette.gold,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
