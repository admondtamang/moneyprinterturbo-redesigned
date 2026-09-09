import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cat } from "../Cat";

export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Outro background"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(160deg, #ffb26b 0%, #f0764a 100%)",
      }}
    >
      <div style={{ scale: 0.55 }}>
        <Cat />
      </div>
      <Interactive.Div
        name="Outro title"
        style={{
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 92,
          color: "#2b2320",
          textAlign: "center",
          marginTop: 12,
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        Thanks for watching!
      </Interactive.Div>
    </AbsoluteFill>
  );
};
