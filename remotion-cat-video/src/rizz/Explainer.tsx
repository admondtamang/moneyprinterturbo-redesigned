import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { type Caption } from "@remotion/captions";
import { palette } from "../facts/palette";
import { VOICEOVER_DIR } from "./script";
import { fontFamily, Karaoke, Mascot, type MouthCue } from "./components";
import captionsJson from "./captions.explainer.json";
import visemesJson from "./visemes.explainer.json";

const captions = captionsJson as Caption[];
const cues = visemesJson.mouthCues as MouthCue[];

// Each step is anchored to the first time its keyword is spoken, read out of
// the same word timings that drive the captions — so the strip can never drift
// from the narration, and re-recording the line re-anchors it automatically.
const STEPS = [
  { keyword: "writes", label: "Script", detail: "a human writes the lines" },
  { keyword: "Gemini", label: "Gemini TTS", detail: "text becomes a voice" },
  { keyword: "pitches", label: "ffmpeg", detail: "pitch it up, it's a cat" },
  { keyword: "Whisper", label: "Whisper", detail: "when each word lands" },
  { keyword: "Remotion", label: "Remotion", detail: "paint the karaoke" },
] as const;

const bare = (text: string) => text.trim().replace(/[.,!?]/g, "").toLowerCase();

const anchoredSteps = STEPS.map((step) => {
  // First occurrence: "writes" is also spoken later in "writes down exactly",
  // and the step belongs to the earlier mention.
  const hit = captions.find((caption) => bare(caption.text) === bare(step.keyword));
  if (!hit) {
    throw new Error(
      `Explainer step "${step.label}" has no spoken keyword "${step.keyword}" in captions.explainer.json`,
    );
  }
  return { ...step, startMs: hit.startMs };
});

const StepRow: React.FC<{
  step: (typeof anchoredSteps)[number];
  index: number;
  state: "pending" | "active" | "done";
}> = ({ step, index, state }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Pop the row on the frame its keyword is spoken.
  const enter = spring({
    frame: frame - (step.startMs / 1000) * fps,
    fps,
    config: { damping: 13, mass: 0.5 },
  });
  const pop = state === "pending" ? 0 : enter;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 90px",
        height: 92,
        opacity: state === "pending" ? 0.28 : state === "done" ? 0.55 : 1,
        transform: `scale(${interpolate(pop, [0, 1], [1, state === "active" ? 1.04 : 1])})`,
        transformOrigin: "left center",
      }}
    >
      <div
        style={{
          width: 54,
          height: 54,
          flexShrink: 0,
          borderRadius: 27,
          border: `4px solid ${state === "active" ? palette.gold : palette.goldDim}`,
          backgroundColor: state === "active" ? palette.gold : "transparent",
          color: state === "active" ? palette.background : palette.goldDim,
          fontFamily,
          fontWeight: 800,
          fontSize: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {index + 1}
      </div>
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 42,
            color: state === "active" ? palette.gold : palette.textPrimary,
          }}
        >
          {step.label}
        </div>
        <div
          style={{
            fontFamily,
            fontWeight: 800,
            fontSize: 25,
            color: palette.textMuted,
          }}
        >
          {step.detail}
        </div>
      </div>
    </div>
  );
};

const StepStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const activeIndex = anchoredSteps.reduce(
    (latest, step, index) => (step.startMs <= currentMs ? index : latest),
    -1,
  );

  return (
    <div style={{ position: "absolute", top: 230, left: 0, right: 0 }}>
      {anchoredSteps.map((step, index) => (
        <StepRow
          key={step.label}
          step={step}
          index={index}
          state={
            index === activeIndex
              ? "active"
              : index < activeIndex
                ? "done"
                : "pending"
          }
        />
      ))}
    </div>
  );
};

export const Explainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      <div
        style={{
          position: "absolute",
          top: 110,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontWeight: 800,
          fontSize: 62,
          color: palette.textPrimary,
        }}
      >
        How Rizz Gets Made
      </div>

      <StepStrip />

      <Karaoke captions={captions} topPercent={60} fontSize={60} />

      {/* Bottom-right: the step strip owns the left side. */}
      <div style={{ position: "absolute", right: 30, bottom: 0 }}>
        <Mascot width={400} cues={cues} flip />
      </div>

      <Audio src={staticFile(`voiceover/${VOICEOVER_DIR}/explainer.mp3`)} />
      <Audio src={staticFile("audio/background.mp3")} volume={0.1} loop />
    </AbsoluteFill>
  );
};
