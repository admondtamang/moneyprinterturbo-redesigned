import { fade } from "@remotion/transitions/fade";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { IntroScene } from "./scenes/IntroScene";
import { CatScene } from "./scenes/CatScene";
import { OutroScene } from "./scenes/OutroScene";

export const CatVideo: React.FC = () => {
  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={60} name="Intro">
        <IntroScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence durationInFrames={180} name="Cat">
        <CatScene />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: 15 })}
      />
      <TransitionSeries.Sequence durationInFrames={60} name="Outro">
        <OutroScene />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
