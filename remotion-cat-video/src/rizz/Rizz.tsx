import { type Caption } from "@remotion/captions";
import { Short, type MouthCue } from "./components";
import captionsJson from "./captions.rizz.json";
import visemesJson from "./visemes.rizz.json";

export const Rizz: React.FC = () => (
  <Short
    captions={captionsJson as Caption[]}
    cues={visemesJson.mouthCues as MouthCue[]}
    slug="rizz"
  />
);
