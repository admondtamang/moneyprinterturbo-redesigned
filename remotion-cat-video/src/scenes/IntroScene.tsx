import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill
      name="Intro background"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(160deg, #ffb26b 0%, #f0764a 100%)",
      }}
    >
      <Interactive.Div
        name="Intro title"
        style={{
          fontFamily: "sans-serif",
          fontWeight: 800,
          fontSize: 108,
          color: "#2b2320",
          textAlign: "center",
          opacity: interpolate(frame, [0, 0.5 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          scale: interpolate(frame, [0, 0.6 * fps], [0.85, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.spring({ damping: 200 }),
            output: "perceptual-scale",
          }),
        }}
      >
        Meet Whiskers
      </Interactive.Div>
      <Interactive.Div
        name="Intro subtitle"
        style={{
          fontFamily: "sans-serif",
          fontWeight: 500,
          fontSize: 48,
          color: "#2b2320",
          marginTop: 24,
          opacity: interpolate(frame, [0.6 * fps, 1.1 * fps], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        a cat, drawn frame by frame
      </Interactive.Div>
    </AbsoluteFill>
  );
};
