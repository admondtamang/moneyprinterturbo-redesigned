import { CalculateMetadataFunction, staticFile } from "remotion";
import { getAudioDuration } from "../facts/get-audio-duration";
import { VOICEOVER_DIR } from "./script";

const FPS = 30;
const TAIL_BUFFER_FRAMES = 20;

// Duration comes from the real voiceover file, so a re-recorded line resizes
// the composition without anyone editing a frame count.
export const audioDurationMetadata =
  (slug: string): CalculateMetadataFunction<Record<string, unknown>> =>
  async () => {
    const seconds = await getAudioDuration(
      staticFile(`voiceover/${VOICEOVER_DIR}/${slug}.mp3`),
    );

    return {
      durationInFrames: Math.ceil(seconds * FPS) + TAIL_BUFFER_FRAMES,
    };
  };

export const calculateRizzMetadata = audioDurationMetadata("rizz");
