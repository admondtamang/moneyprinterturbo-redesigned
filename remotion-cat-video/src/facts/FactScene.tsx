import { Audio } from "@remotion/media";
import {
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Fact } from "./factsData";
import { palette } from "./palette";
import { serif, sans } from "./fonts";

export const FactScene: React.FC<{
  fact: Fact;
  index: number;
  total: number;
  durationInFrames: number;
  voiceoverDir?: string;
}> = ({ fact, index, total, durationInFrames, voiceoverDir = "five-cat-facts" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { Icon } = fact;

  const iconIn = interpolate(frame, [0, 0.7 * fps], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  const words = fact.title.split(" ");

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: palette.background,
      }}
    >
      <Audio
        src={staticFile(`voiceover/${voiceoverDir}/fact-${fact.number}.mp3`)}
        volume={(f) =>
          interpolate(
            f,
            [0, 8, durationInFrames - 15, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />

      {/* soft vignette */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 90% at 50% 38%, rgba(227,168,86,0.10) 0%, rgba(20,16,13,0) 60%)",
        }}
      />

      {/* top kicker row */}
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 80,
          right: 80,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <span
          style={{
            fontFamily: sans,
            fontWeight: 600,
            fontSize: 30,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: palette.gold,
          }}
        >
          Cat Facts
        </span>
        <span
          style={{
            fontFamily: serif,
            fontWeight: 600,
            fontSize: 34,
            color: palette.textMuted,
          }}
        >
          {fact.number} / {String(total).padStart(2, "0")}
        </span>
      </div>

      {/* icon badge */}
      <div
        style={{
          position: "absolute",
          top: 300,
          left: "50%",
          translate: "-50% 0",
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: palette.panel,
          border: `2px solid ${palette.gold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          scale: interpolate(frame, [0, 0.5 * fps], [0.8, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
          opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Icon progress={iconIn} />
      </div>

      {/* title */}
      <div
        style={{
          position: "absolute",
          top: 700,
          left: 80,
          right: 80,
          textAlign: "center",
          fontFamily: serif,
          fontWeight: 700,
          fontSize: 88,
          lineHeight: 1.08,
          color: palette.textPrimary,
        }}
      >
        {words.map((word, i) => {
          const start = 0.6 * fps + i * 4;
          return (
            <span
              key={`${word}-${i}`}
              style={{
                display: "inline-block",
                marginRight: 22,
                opacity: interpolate(frame, [start, start + 10], [0, 1], {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.bezier(0.16, 1, 0.3, 1),
                }),
                translate: `0 ${interpolate(
                  frame,
                  [start, start + 10],
                  [24, 0],
                  {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                    easing: Easing.bezier(0.16, 1, 0.3, 1),
                  },
                )}px`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* detail */}
      <div
        style={{
          position: "absolute",
          top: 1000,
          left: 130,
          right: 130,
          textAlign: "center",
          fontFamily: sans,
          fontWeight: 400,
          fontSize: 46,
          lineHeight: 1.4,
          color: palette.textMuted,
          opacity: interpolate(frame, [1.3 * fps, 1.8 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {fact.detail}
      </div>

      {/* progress bar */}
      <div
        style={{
          position: "absolute",
          bottom: 130,
          left: 80,
          right: 80,
          display: "flex",
          gap: 12,
        }}
      >
        {Array.from({ length: total }).map((_, i) => {
          const fill =
            i < index
              ? 1
              : i > index
                ? 0
                : interpolate(frame, [0, durationInFrames], [0, 1], {
                    extrapolateLeft: "clamp",
                    extrapolateRight: "clamp",
                  });
          return (
            <div
              key={`segment-${i}`}
              style={{
                flex: 1,
                height: 5,
                borderRadius: 3,
                background: palette.goldDim,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${fill * 100}%`,
                  height: "100%",
                  background: palette.gold,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
