// Scrub-and-look proof sheet for src/reel/motion.ts. Not audience-facing.
// Every row re-triggers every 2 bars so any scrub position shows motion.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { palette } from "../facts/palette";
import { sans, serif } from "../facts/fonts";
import { bar, beat } from "./beats";
import {
  blurSwap,
  FIRM,
  HOUSE,
  maskReveal,
  morphBox,
  slam,
  springAt,
  sumSprings,
} from "./motion";

const CYCLE = bar(2); // 240 frames — the lab loops every 2 bars

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ padding: "34px 64px", borderTop: `2px solid ${palette.panel}` }}>
    <div
      style={{
        fontFamily: sans,
        fontSize: 26,
        fontWeight: 600,
        letterSpacing: 3,
        textTransform: "uppercase",
        color: palette.goldDim,
        marginBottom: 20,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

export const MotionLab: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const f = frame % CYCLE;

  const theSlam = slam(f, fps, beat(0));
  const reveal = maskReveal(f, fps, beat(1), 18);

  // One value, four targets: the sum of one spring per change.
  const x = sumSprings(f, fps, 0, [
    { at: beat(0), delta: 420 },
    { at: beat(2), delta: -180 },
    { at: beat(4), delta: 540 },
    { at: beat(6), delta: -780 },
  ]);

  const box = morphBox(f, fps, beat(3), { w: 220, h: 220, r: 16 }, { w: 820, h: 300, r: 60 });
  const swap = blurSwap(f, fps, beat(3) + 12);

  const house = springAt(f, fps, beat(5), HOUSE);
  const firm = springAt(f, fps, beat(5), FIRM);

  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      <div
        style={{
          fontFamily: sans,
          fontSize: 24,
          fontWeight: 500,
          color: palette.textMuted,
          padding: "48px 64px 0",
          letterSpacing: 2,
        }}
      >
        MOTIONLAB · frame {frame} · cycle frame {f} · beat {(f / 30).toFixed(2)}
      </div>

      <Row label="slam(frame, fps, at)">
        <div
          style={{
            fontFamily: serif,
            fontSize: 132,
            fontWeight: 900,
            color: palette.textPrimary,
            transform: theSlam.transform,
            transformOrigin: "left center",
          }}
        >
          GUILTY?
        </div>
      </Row>

      <Row label="maskReveal(frame, fps, at, 18)">
        <div
          style={{
            fontFamily: serif,
            fontSize: 92,
            fontWeight: 700,
            color: palette.gold,
            clipPath: reveal.clipPath,
          }}
        >
          THE CHARGE IS KNOCKING
        </div>
      </Row>

      <Row label="sumSprings — one value, four targets">
        <div style={{ position: "relative", height: 120 }}>
          <div
            style={{
              position: "absolute",
              left: x,
              top: 0,
              width: 100,
              height: 100,
              borderRadius: 12,
              backgroundColor: palette.gold,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              fontFamily: sans,
              fontSize: 24,
              color: palette.textMuted,
            }}
          >
            x = {x.toFixed(1)}
          </div>
        </div>
      </Row>

      <Row label="morphBox + blurSwap — one container never cuts">
        <div
          style={{
            width: box.width,
            height: box.height,
            borderRadius: box.borderRadius,
            backgroundColor: palette.panel,
            border: `3px solid ${palette.goldDim}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontFamily: serif,
              fontSize: 64,
              fontWeight: 700,
              color: palette.textPrimary,
              filter: swap.filter,
            }}
          >
            {swap.showingTo ? "EXHIBIT B" : "A"}
          </div>
        </div>
      </Row>

      <Row label="springAt — HOUSE (tiny overshoot) vs FIRM (none)">
        <div style={{ position: "relative", height: 170 }}>
          {([
            ["HOUSE", house],
            ["FIRM", firm],
          ] as const).map(([name, p], i) => (
            <div key={name} style={{ position: "relative", height: 80 }}>
              <div
                style={{
                  position: "absolute",
                  left: 140 + p * 760,
                  top: 0,
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: i === 0 ? palette.gold : palette.textMuted,
                }}
              />
              <div
                style={{
                  fontFamily: sans,
                  fontSize: 24,
                  color: palette.textMuted,
                  lineHeight: "56px",
                }}
              >
                {name} {p.toFixed(3)}
              </div>
            </div>
          ))}
        </div>
      </Row>
    </AbsoluteFill>
  );
};
