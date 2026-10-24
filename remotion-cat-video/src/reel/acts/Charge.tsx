// Charge — beats 4-11. See docs/shotlist.md §3 rows 4-11; copy is §2.2.
//
// Beat 4 is the other half of the hook/charge seam. The 7 mug fragments broken on beat 3 do not
// fade out and get replaced by a panel — they fly on and BECOME the panel. Hook.tsx owns the
// formula (`fragmentState`) and draws them up to beat 4; this act draws the same 7 pieces from
// beat 4 until the solid panel rect takes over on beat 5, behind a short blur swap.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beat } from "../beats";
import { FIRM, HOUSE, blurSwap, maskReveal, slam, springAt, sumSprings } from "../motion";
import { H } from "../stage";
import { CatHead, Gavel, MUG_FRAGMENTS } from "../glyphs";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";
import { COLLAPSE, PANEL, PANEL_SEAM, fragmentClip, fragmentState } from "./Hook";

export const FROM_BEAT = 4;
export const TO_BEAT = 11;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const PAD = 48;
const INNER = PANEL.w - PAD * 2;
/** Beat 5 — the panel settles to its final size and radius and the fragments hand over. */
const SETTLE = beat(5);
const LOWER_TOP = PANEL.y + PANEL_SEAM;
const LOWER_H = PANEL.h - PANEL_SEAM;
/** How far the lower half drops on beat 10 to open the defendant slot. */
const SLOT = 180;
const COUNT_W = 330;

// Rows, as offsets from PANEL.y.
const Y_HEADER = 72;
const Y_DOCKET = 184;
const Y_RULE = 262;
const Y_COUNT = 316;
const Y_LINE1 = 440;
const Y_LINE2 = 528;

const DOCKET = "01-CAT";

/** Docket digits scrubbing into place (beat 6). Seeded on the frame — pure, never Math.random. */
const scrubDocket = (frame: number) => {
  const p = interpolate(frame, [beat(6), beat(6) + 22], [0, 1], CLAMP);
  return DOCKET.split("")
    .map((ch, i) => {
      const t = interpolate(p, [i * 0.1, i * 0.1 + 0.4], [0, 1], CLAMP);
      if (t >= 1 || ch === "-") return ch;
      const pool = /[0-9]/.test(ch) ? "0123456789" : "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      return pool[Math.floor(random(`dk-${i}-${Math.floor(frame / 2)}`) * pool.length)];
    })
    .join("");
};

const CHARGE_WORDS = ["WILFUL", "DISPLACEMENT"];

export const Charge: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < COLLAPSE || frame >= beat(TO_BEAT + 1)) return null;

  const settled = frame >= SETTLE;
  const swap = blurSwap(frame, fps, SETTLE, 4, 5);
  const radius = 24 * springAt(frame, fps, SETTLE, FIRM);
  // Beat 9: the panel flexes 1% and recovers.
  const flex = sumSprings(frame, fps, 1, [
    { at: beat(9), delta: 0.01, config: HOUSE },
    { at: beat(9) + 9, delta: -0.01, config: HOUSE },
  ]);
  // Beat 10: the lower half slides down and opens the defendant slot.
  const slide = sumSprings(frame, fps, 0, [{ at: beat(10), delta: SLOT, config: FIRM }]);

  // Beat 5: case header mask-reveals top-down inside the panel.
  const header = interpolate(frame, [SETTLE, SETTLE + 14], [0, 1], CLAMP);
  // Beat 6: gold hairline rule draws left to right.
  const rule = interpolate(frame, [beat(6), beat(6) + 18], [0, 1], CLAMP);
  const docketMask = maskReveal(frame, fps, beat(6), 14).clipPath;
  // Beat 7: redaction bar sweeps right, then retracts to the right leaving COUNT ONE behind.
  const sweepIn = interpolate(frame, [beat(7), beat(7) + 10], [0, 1], CLAMP);
  const sweepOut = interpolate(frame, [beat(7) + 12, beat(7) + 30], [0, 1], CLAMP);
  const barL = COUNT_W * sweepOut;
  const barW = Math.max(0, COUNT_W * sweepIn - barL);
  // Beat 10: the charge text shrinks to a header above the defendant slot.
  const shrink = springAt(frame, fps, beat(10), FIRM);
  const chargeT = `translate(0px, ${-20 * shrink}px) scale(${1 - 0.38 * shrink})`;
  // Beat 10/11: defendant glyph, then label; gavel rises frame-right, cocked.
  const catIn = springAt(frame, fps, beat(10) + 8, FIRM);
  const defendant = maskReveal(frame, fps, beat(11), 16).clipPath;
  const gavelY = sumSprings(frame, fps, H, [{ at: beat(11), delta: -670, config: FIRM }]);

  const panelBase: React.CSSProperties = {
    position: "absolute",
    left: PANEL.x,
    width: PANEL.w,
    backgroundColor: palette.panel,
  };

  return (
    <AbsoluteFill>
      <div style={{ filter: swap.filter }}>
        {!settled ? (
          <svg
            width={1080}
            height={H}
            viewBox={`0 0 1080 ${H}`}
            style={{ position: "absolute", left: 0, top: 0 }}
          >
            <defs>
              <clipPath id="charge-frag-clip">
                <rect {...fragmentClip(frame, fps)} />
              </clipPath>
            </defs>
            <g clipPath="url(#charge-frag-clip)">
              {MUG_FRAGMENTS.map((d, i) => {
                const st = fragmentState(frame, fps, i);
                return <path key={i} d={d} transform={st.transform} fill={st.fill} />;
              })}
            </g>
          </svg>
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1080,
              height: H,
              transform: `scale(${flex})`,
              transformOrigin: `${PANEL.x + PANEL.w / 2}px ${PANEL.y + PANEL.h / 2}px`,
            }}
          >
            {/* --- upper half: case header, docket, count, charge ------------------- */}
            <div
              style={{
                ...panelBase,
                top: PANEL.y,
                height: PANEL_SEAM,
                borderRadius: `${radius}px ${radius}px 0 0`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: PAD,
                  top: Y_HEADER,
                  width: INNER,
                  fontFamily: serif,
                  fontWeight: 600,
                  fontSize: 64,
                  lineHeight: 1.05,
                  color: palette.textPrimary,
                  clipPath: `inset(${(1 - header) * 100}% 0 0 0)`,
                }}
              >
                THE STATE v. THE CAT
              </div>

              <div
                style={{
                  position: "absolute",
                  left: PAD,
                  top: Y_DOCKET,
                  width: INNER,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 38,
                  letterSpacing: 4,
                  color: palette.textMuted,
                  clipPath: docketMask,
                }}
              >
                {`DOCKET No. ${scrubDocket(frame)}`}
              </div>

              <div
                style={{
                  position: "absolute",
                  left: PAD,
                  top: Y_RULE,
                  width: INNER,
                  height: 2,
                  backgroundColor: palette.gold,
                  transform: `scaleX(${rule})`,
                  transformOrigin: "0% 50%",
                }}
              />

              <div style={{ transform: chargeT, transformOrigin: `${PAD}px ${Y_COUNT}px` }}>
              <div
                style={{
                  position: "absolute",
                  left: PAD,
                  top: Y_COUNT,
                  width: COUNT_W,
                  height: 54,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 6,
                    fontFamily: sans,
                    fontWeight: 600,
                    fontSize: 38,
                    letterSpacing: 8,
                    color: palette.gold,
                    clipPath: `inset(0 ${(1 - sweepOut) * 100}% 0 0)`,
                  }}
                >
                  COUNT ONE
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: barL,
                    top: 0,
                    width: barW,
                    height: 54,
                    backgroundColor: palette.gold,
                  }}
                />
              </div>

                <div
                  style={{
                    position: "absolute",
                    left: PAD,
                    top: Y_LINE1,
                    width: INNER,
                    fontFamily: serif,
                    fontWeight: 700,
                    fontSize: 58,
                    lineHeight: 1.1,
                    color: palette.textPrimary,
                    whiteSpace: "nowrap",
                  }}
                >
                  {CHARGE_WORDS.map((w, i) => {
                    const s = slam(frame, fps, beat(8) + i * 6);
                    return (
                      <span
                        key={w}
                        style={{
                          display: "inline-block",
                          transform: s.transform,
                          transformOrigin: "0% 0%",
                          visibility: frame >= beat(8) + i * 6 ? "visible" : "hidden",
                          marginRight: 18,
                        }}
                      >
                        {w}
                      </span>
                    );
                  })}
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: PAD,
                    top: Y_LINE2,
                    width: INNER,
                    fontFamily: serif,
                    fontWeight: 700,
                    fontSize: 58,
                    lineHeight: 1.15,
                    color: palette.textPrimary,
                    whiteSpace: "nowrap",
                    transform: slam(frame, fps, beat(9)).transform,
                    transformOrigin: "0% 0%",
                    visibility: frame >= beat(9) ? "visible" : "hidden",
                  }}
                >
                  OF ONE CERAMIC MUG
                </div>
              </div>
            </div>

            {/* --- lower half: slides down on beat 10 to open the defendant slot ----- */}
            <div
              style={{
                ...panelBase,
                top: LOWER_TOP + slide,
                height: LOWER_H,
                borderRadius: `0 0 ${radius}px ${radius}px`,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: PAD,
                  top: 150,
                  width: INNER,
                  fontFamily: sans,
                  fontWeight: 600,
                  fontSize: 38,
                  letterSpacing: 3,
                  color: palette.textPrimary,
                  whiteSpace: "nowrap",
                  clipPath: defendant,
                }}
              >
                DEFENDANT: FELIS CATUS
              </div>
            </div>

            {/* --- the defendant glyph, scaling into the open slot ------------------- */}
            <div
              style={{
                position: "absolute",
                left: PANEL.x + PANEL.w / 2 - 95,
                top: LOWER_TOP + SLOT / 2 - 95,
                transform: `scale(${catIn})`,
                transformOrigin: "50% 50%",
              }}
            >
              <CatHead size={190} color={palette.gold} strokeWidth={6} />
            </div>
          </div>
        )}
      </div>

      {/* --- beat 11: the gavel rises frame-right, cocked ------------------------ */}
      <div
        style={{
          position: "absolute",
          left: 700,
          top: gavelY,
          transform: "rotate(-22deg)",
          transformOrigin: "50% 100%",
        }}
      >
        <Gavel size={280} color={palette.gold} />
      </div>
    </AbsoluteFill>
  );
};
