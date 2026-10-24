// ExhibitB — beats 16-19. See docs/shotlist.md §3 rows 16-19 and §4 "Exhibit B".
//
// Mechanism: TRANSLATION ALONG ONE AXIS. ExhibitA's square card rotates about its horizontal
// axis and FLATTENS into a full-width left-to-right track (the label flips A->B on that same
// rotation). Five station ticks snap on and stamp POKE / BAT / SCOOP / POUNCE / GRASP, one per
// 6 frames. A paw silhouette walks the track; each station flares gold and sprouts a motion arc
// as it passes. The track then compresses from both ends into the single bar ExhibitC extrudes.
import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { beat } from "../beats";
import { FIRM, maskReveal, slam, springAt } from "../motion";
import { PAW_SILHOUETTE_PATH, PAW_SILHOUETTE_VIEWBOX } from "../glyphs";
import { palette } from "../../facts/palette";
import { sans, serif } from "../../facts/fonts";
import { CARD, CX } from "./ExhibitA";

export const FROM_BEAT = 16;
export const TO_BEAT = 19;

/** Full width of the SAFE area. The eye is dragged across all of it. */
export const TRACK = { x: 72, y: 620, w: 848, h: 420 } as const;

/** What the track compresses into. ExhibitC extrudes this upward into its box. */
export const BAR = { cx: CX, cy: TRACK.y + TRACK.h / 2, w: 320, h: 40 } as const;

const STATIONS = ["POKE", "BAT", "SCOOP", "POUNCE", "GRASP"];
/** Station x in composition px. The middle one lands exactly on CX. */
const stationX = (i: number) => TRACK.x + 88 + (i * (TRACK.w - 176)) / 4;

const CLAIM = "BATTING IS HUNTING";
const DETAIL = ["Object play repeats poke, bat,", "scoop, pounce, grasp."];

/** Short motion arc that sprouts out of a station as the paw clears it. */
const ARC_PATH = "M0 0 Q 34 -54 88 -22";
const ARC_LEN = 114;

const TRAVEL_FROM = TRACK.x + 24;
const TRAVEL_TO = TRACK.x + TRACK.w - 24;
const TRAVEL_FRAMES = 28;

export const ExhibitB: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < beat(FROM_BEAT) || frame >= beat(20)) return null;

  // ---- beat 16: the card rotates about its horizontal axis and flattens into the track.
  const flip = springAt(frame, fps, beat(16), FIRM);
  // ---- beat 19: the track compresses from both ends toward centre into one bar.
  const squeeze = springAt(frame, fps, beat(19), FIRM);
  const trackW = TRACK.w + (BAR.w - TRACK.w) * squeeze;
  const trackH = TRACK.h + (BAR.h - TRACK.h) * squeeze;

  const w = CARD.w + (trackW - CARD.w) * flip;
  const h = CARD.h + (trackH - CARD.h) * flip;
  const cy = CARD.y + CARD.h / 2 + (BAR.cy - (CARD.y + CARD.h / 2)) * flip;
  const back = flip >= 0.5; // past edge-on: the track face is showing

  // ---- beat 17: ticks snap on, one per 6 frames, and stamp their word.
  // ---- beat 18: the paw travels the track; stations flare as it clears them.
  const pawCx = interpolate(frame, [beat(18), beat(18) + TRAVEL_FRAMES], [TRAVEL_FROM, TRAVEL_TO], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const passFrame = (i: number) =>
    beat(18) + (TRAVEL_FRAMES * (stationX(i) - TRAVEL_FROM)) / (TRAVEL_TO - TRAVEL_FROM);

  const claim = slam(frame, fps, beat(19) + 6);

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* ONE container: the exhibit card and the track are the same box, mid-rotation. */}
      <div
        style={{
          position: "absolute",
          left: CX - w / 2,
          top: cy - h / 2,
          width: w,
          height: h,
          borderRadius: back ? 10 : CARD.r,
          backgroundColor: palette.panel,
          border: `3px solid ${palette.goldDim}`,
          overflow: "hidden",
          transform: `perspective(2200px) rotateX(${180 * flip}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {back ? (
          // Track face. rotateX(180deg) mirrors it, so un-mirror the content with scaleY(-1).
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: TRACK.w,
              height: TRACK.h,
              marginLeft: -TRACK.w / 2,
              marginTop: -TRACK.h / 2,
              transform: `scaleY(-1) scale(${w / TRACK.w}, ${h / TRACK.h})`,
            }}
          >
            {/* the rail itself, drawn left to right */}
            <div
              style={{
                position: "absolute",
                left: 24,
                top: TRACK.h / 2 - 2,
                width: TRACK.w - 48,
                height: 4,
                backgroundColor: palette.goldDim,
                clipPath: maskReveal(frame, fps, beat(16) + 10, 14).clipPath,
              }}
            />
            {STATIONS.map((wd, i) => {
              const snap = springAt(frame, fps, beat(17) + i * 6, FIRM);
              const flare = springAt(frame, fps, passFrame(i), FIRM);
              const lit = flare > 0.02;
              const st = slam(frame, fps, beat(17) + i * 6 + 3);
              return (
                <React.Fragment key={wd}>
                  <div
                    style={{
                      position: "absolute",
                      left: stationX(i) - TRACK.x - (lit ? 3 : 2),
                      top: TRACK.h / 2 - 55,
                      width: lit ? 7 : 5,
                      height: 110,
                      backgroundColor: lit ? palette.gold : palette.goldDim,
                      transform: `scaleY(${snap * (1 + 0.45 * flare * (1 - flare))})`,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: stationX(i) - TRACK.x - 120,
                      top: TRACK.h / 2 + 62,
                      width: 240,
                      textAlign: "center",
                      fontFamily: sans,
                      fontWeight: 600,
                      fontSize: 40,
                      letterSpacing: 0,
                      color: lit ? palette.gold : palette.textPrimary,
                      transform: st.transform,
                      clipPath: `inset(0 0 ${(1 - st.p) * 100}% 0)`,
                    }}
                  >
                    {wd}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        ) : (
          // Card face carried over from Exhibit A, foreshortening as it goes edge-on.
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: CARD.w,
              height: CARD.h,
              marginLeft: -CARD.w / 2,
              marginTop: -CARD.h / 2,
              transform: `scale(${w / CARD.w}, ${h / CARD.h})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: serif,
              fontWeight: 700,
              fontSize: 64,
              color: palette.textPrimary,
            }}
          >
            THE PAW IS A SENSOR
          </div>
        )}
      </div>

      {/* Label flips A -> B on the same rotation as the card. */}
      <div
        style={{
          position: "absolute",
          left: TRACK.x + 6,
          top: 340,
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 44,
          letterSpacing: 12,
          color: palette.gold,
          transform: `perspective(900px) rotateX(${180 * flip}deg) scaleY(${back ? -1 : 1})`,
        }}
      >
        EXHIBIT {back ? "B" : "A"}
      </div>

      {/* The travelling paw and the arcs it kicks out of each station live ABOVE the track box. */}
      {frame >= beat(18) && squeeze < 0.02 ? (
        <>
          <svg
            width={180}
            height={108}
            viewBox={PAW_SILHOUETTE_VIEWBOX}
            style={{
              position: "absolute",
              left: pawCx - 90,
              top: TRACK.y - 128,
              transform: "scaleX(-1)",
            }}
          >
            <path d={PAW_SILHOUETTE_PATH} fill={palette.gold} />
          </svg>
          {STATIONS.map((wd, i) => {
            const d = frame - passFrame(i);
            if (d < 0 || d > 26) return null;
            const p = Math.min(1, d / 12);
            return (
              <svg
                key={wd}
                width={114}
                height={80}
                viewBox="-6 -62 100 72"
                style={{ position: "absolute", left: stationX(i) + 6, top: TRACK.y + 139 }}
              >
                <path
                  d={ARC_PATH}
                  fill="none"
                  stroke={palette.gold}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeDasharray={ARC_LEN}
                  strokeDashoffset={ARC_LEN * (1 - p)}
                />
              </svg>
            );
          })}
        </>
      ) : null}

      {/* ---- beat 19: claim slams beneath the compressed bar; detail reveals under it. */}
      <div
        style={{
          position: "absolute",
          left: TRACK.x,
          top: 1150,
          width: TRACK.w,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 68,
          color: palette.textPrimary,
          transform: claim.transform,
          clipPath: `inset(0 0 ${(1 - claim.p) * 100}% 0)`,
        }}
      >
        {CLAIM}
      </div>
      {DETAIL.map((line, i) => {
        const m = maskReveal(frame, fps, beat(19) + 13 + i * 5, 11);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: TRACK.x,
              top: 1280 + i * 50,
              width: TRACK.w,
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
