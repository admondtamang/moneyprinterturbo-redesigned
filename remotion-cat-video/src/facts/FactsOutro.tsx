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

export const FactsOutro: React.FC<{ durationInFrames?: number }> = ({
  durationInFrames = 75,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

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
        src={staticFile("voiceover/five-cat-facts/outro.mp3")}
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
            "radial-gradient(120% 70% at 50% 55%, rgba(227,168,86,0.12) 0%, rgba(20,16,13,0) 60%)",
        }}
      />

      <div
        style={{
          scale: 0.55,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        <Cat />
      </div>

      <div
        style={{
          fontFamily: serif,
          fontWeight: 800,
          fontSize: 84,
          color: palette.textPrimary,
          marginTop: 8,
          textAlign: "center",
          maxWidth: 900,
          padding: "0 80px",
          opacity: interpolate(frame, [0.5 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Which fact surprised you?
      </div>

      <div
        style={{
          fontFamily: sans,
          fontWeight: 500,
          fontSize: 40,
          letterSpacing: 2,
          color: palette.gold,
          marginTop: 24,
          textTransform: "uppercase",
          opacity: interpolate(frame, [1.2 * fps, 1.7 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          }),
        }}
      >
        Follow for more · Whiskers Studio
      </div>
    </div>
  );
};
