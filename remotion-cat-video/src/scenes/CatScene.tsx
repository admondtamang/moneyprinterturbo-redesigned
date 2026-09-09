import {
  AbsoluteFill,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Cat } from "../Cat";

const Caption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  return (
    <Interactive.Div
      name="Caption"
      style={{
        fontFamily: "sans-serif",
        fontWeight: 700,
        fontSize: 54,
        color: "#fff8f0",
        textAlign: "center",
        maxWidth: 900,
        opacity: interpolate(
          frame,
          [0, 0.3 * fps, durationInFrames - 0.3 * fps, durationInFrames],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          },
        ),
      }}
    >
      {text}
    </Interactive.Div>
  );
};

export const CatScene: React.FC = () => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill name="Cat scene background" style={{ background: "#2b2320" }}>
      <AbsoluteFill
        name="Cat holder"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          bottom: 380,
        }}
      >
        <Cat />
      </AbsoluteFill>
      <AbsoluteFill
        name="Caption holder"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          top: "auto",
          height: 260,
          padding: "0 80px",
        }}
      >
        <Sequence
          name="Caption 1"
          from={0}
          durationInFrames={2 * fps}
          layout="none"
        >
          <Caption text="Cats spend 70% of their life asleep" />
        </Sequence>
        <Sequence
          name="Caption 2"
          from={2 * fps}
          durationInFrames={2 * fps}
          layout="none"
        >
          <Caption text="A cat's purr can start at just 25 Hz" />
        </Sequence>
        <Sequence
          name="Caption 3"
          from={4 * fps}
          durationInFrames={2 * fps}
          layout="none"
        >
          <Caption text="Whiskers are as wide as their body" />
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
