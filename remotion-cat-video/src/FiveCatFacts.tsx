import { Audio } from "@remotion/media";
import { fade } from "@remotion/transitions/fade";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import {
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { FactsIntro } from "./facts/FactsIntro";
import { FactsOutro } from "./facts/FactsOutro";
import { FactScene } from "./facts/FactScene";
import { facts } from "./facts/factsData";

const TRANSITION_DURATION = 15;

export type FiveCatFactsProps = {
  sceneDurations?: {
    intro: number;
    facts: number[];
    outro: number;
  };
};

const DEFAULT_SCENE_DURATIONS = {
  intro: 75,
  facts: [135, 135, 135, 135, 135],
  outro: 75,
};

const BackgroundMusic: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <Audio
      src={staticFile("audio/background.mp3")}
      loop
      loopVolumeCurveBehavior="extend"
      volume={interpolate(
        frame,
        [0, 1.5 * 30, durationInFrames - 1.5 * 30, durationInFrames],
        [0, 0.22, 0.22, 0],
        { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
      )}
    />
  );
};

export const FiveCatFacts: React.FC<FiveCatFactsProps> = ({
  sceneDurations = DEFAULT_SCENE_DURATIONS,
}) => {
  const factSlots = facts.flatMap((fact, i) => [
    <TransitionSeries.Transition
      key={`transition-${fact.number}`}
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
    />,
    <TransitionSeries.Sequence
      key={`fact-${fact.number}`}
      durationInFrames={sceneDurations.facts[i]}
      name={`Fact ${fact.number}`}
    >
      <FactScene
        fact={fact}
        index={i}
        total={facts.length}
        durationInFrames={sceneDurations.facts[i]}
      />
    </TransitionSeries.Sequence>,
  ]);

  return (
    <>
      <BackgroundMusic />
      <TransitionSeries>
        <TransitionSeries.Sequence
          durationInFrames={sceneDurations.intro}
          name="Intro"
        >
          <FactsIntro durationInFrames={sceneDurations.intro} />
        </TransitionSeries.Sequence>
        {factSlots}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION_DURATION })}
        />
        <TransitionSeries.Sequence
          durationInFrames={sceneDurations.outro}
          name="Outro"
        >
          <FactsOutro durationInFrames={sceneDurations.outro} />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </>
  );
};
