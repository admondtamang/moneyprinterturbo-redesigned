import { Audio } from "@remotion/media";
import {
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { palette } from "./palette";
import { serif, sans } from "./fonts";
import { Cat } from "../Cat";

export const FactsIntro: React.FC<{
  durationInFrames?: number;
  kicker?: string;
  title?: string;
  subtitle?: string;
  audioSrc?: string;
}> = ({
  durationInFrames = 75,
  kicker = "Whiskers Studio Presents",
  title = "5 Cat Facts You Didn't Know",
  subtitle = "Surprising science, one paw at a time",
  audioSrc = "voiceover/five-cat-facts/intro.mp3",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const ruleWidth = interpolate(frame, [0.3 * fps, 1.1 * fps], [0, 160], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: palette.background,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Audio
        src={staticFile(audioSrc)}
        volume={(f) =>
          interpolate(
            f,
            [0, 8, durationInFrames - 15, durationInFrames],
            [0, 1, 1, 0],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )
        }
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 70% at 50% 30%, rgba(227,168,86,0.12) 0%, rgba(20,16,13,0) 60%)",
        }}
      />

      <div
        style={{
          fontFamily: sans,
          fontWeight: 600,
          fontSize: 32,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: palette.gold,
          opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {kicker}
      </div>

      <div
        style={{
          width: ruleWidth,
          height: 3,
          background: palette.gold,
          margin: "28px 0 36px",
        }}
      />

      <div
        style={{
          fontFamily: serif,
          fontWeight: 900,
          fontSize: 104,
          lineHeight: 1.06,
          textAlign: "center",
          color: palette.textPrimary,
          maxWidth: 880,
          opacity: interpolate(frame, [0.5 * fps, 1.2 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: `0 ${interpolate(
            frame,
            [0.5 * fps, 1.2 * fps],
            [30, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          )}px`,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontFamily: sans,
          fontWeight: 400,
          fontSize: 42,
          color: palette.textMuted,
          marginTop: 28,
          opacity: interpolate(frame, [1.3 * fps, 1.9 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        {subtitle}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 90,
          scale: 0.42,
          opacity: interpolate(frame, [1.8 * fps, 2.4 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Cat />
      </div>
    </div>
  );
};
