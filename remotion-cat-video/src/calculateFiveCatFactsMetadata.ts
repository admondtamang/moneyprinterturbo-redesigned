import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "./facts/get-audio-duration";
import { narrationLines } from "./facts/narration";
import { FiveCatFactsProps } from "./FiveCatFacts";

const FPS = 30;
const TRANSITION_FRAMES = 15;
// Extra hold time after the voiceover line ends before cutting to the next scene.
const TAIL_BUFFER_FRAMES = 20;

export const calculateFiveCatFactsMetadata: CalculateMetadataFunction<
  FiveCatFactsProps
> = async () => {
  const durations = await Promise.all(
    narrationLines.map((line) =>
      getAudioDuration(staticFile(`voiceover/five-cat-facts/${line.id}.mp3`)),
    ),
  );

  const frames = durations.map(
    (seconds) => Math.ceil(seconds * FPS) + TAIL_BUFFER_FRAMES,
  );
  const introFrames = frames[0];
  const outroFrames = frames[frames.length - 1];
  const factFrames = frames.slice(1, -1);

  const totalSceneFrames =
    introFrames + factFrames.reduce((sum, f) => sum + f, 0) + outroFrames;
  const transitionsCount = factFrames.length + 1;

  return {
    durationInFrames: totalSceneFrames - transitionsCount * TRANSITION_FRAMES,
    props: {
      sceneDurations: {
        intro: introFrames,
        facts: factFrames,
        outro: outroFrames,
      },
    },
  };
};
