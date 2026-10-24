// thecatcourt — Film 02: "The State v. The Cat", narrated cut.
//
// SAME PICTURE as Film 01, slowed from 120 BPM to 75 BPM and narrated.
// 1080x1920 @ 60fps, 2112 frames = 35.2s.
//
// How the slowdown works, and why there is no duplicated scene code:
// every act is written against a 120 BPM / 30-frames-per-beat grid (src/reel/beats.ts).
// Rather than fork eight act files onto a second grid, the whole act tree is wrapped in one
// <Sequence playbackRate>. The children keep their own clock and still believe they are on the
// original grid; the composition simply advances that clock at 0.625x.
//   75 / 120 = 0.625  ->  1320 child frames / 0.625 = 2112 composition frames = 35.2s.
// Everything scales uniformly: beats, springs, mask reveals, the loop. Nothing is re-timed by hand.
//
// `playbackRate` on <Sequence> requires Remotion >= 4.0.528 (project is on 4.0.532). Verified
// that the upgrade from 4.0.521 left Film 01 pixel-identical across six sampled frames.
//
// Film 01 is NOT touched by this file. It imports the same acts and composes them itself rather
// than reusing TheCatCourt01, because that component mounts its own 120 BPM score.
import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { palette } from "../facts/palette";
import { FPS, TOTAL_FRAMES } from "./beats";
import {
  NARRATION_START_SECONDS,
  VOICEOVER_DIR,
  narrationLines,
} from "../facts/thecatcourt02Narration";
import { Hook } from "./acts/Hook";
import { Charge } from "./acts/Charge";
import { ExhibitA } from "./acts/ExhibitA";
import { ExhibitB } from "./acts/ExhibitB";
import { ExhibitC } from "./acts/ExhibitC";
import { Deliberation } from "./acts/Deliberation";
import { Verdict } from "./acts/Verdict";
import { Lockup } from "./acts/Lockup";

/** 75 BPM / 120 BPM. The single number that defines this cut. */
export const RATE = 0.625;
/** 1320 child frames played at 0.625x. */
export const FILM02_FRAMES = Math.round(TOTAL_FRAMES / RATE); // 2112

/**
 * The score was mastered to -14 LUFS as a standalone bed. Narration now sits on top, so the bed
 * is pulled down to keep speech intelligible. Provisional — the final value is set by measuring
 * the mixed render, not by ear.
 */
const BED_VOLUME = 0.55;

export const TheCatCourt02: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      {/* Score re-synthesised at 75 BPM. Mounted OUTSIDE the slowed sequence so it plays at
          its own true speed — pulling it inside would pitch-shift and stretch it. */}
      <Audio src={staticFile("audio/thecatcourt-02.mp3")} volume={BED_VOLUME} />

      {/* Narration. Each line is mounted at its own start offset, also OUTSIDE the slowed
          sequence — the speech must play at natural speed. The bed is ducked under it. */}
      {narrationLines.map((line) => (
        <Sequence
          key={line.id}
          from={Math.round(NARRATION_START_SECONDS[line.id] * FPS)}
        >
          <Audio
            src={staticFile(`voiceover/${VOICEOVER_DIR}/${line.id}.mp3`)}
          />
        </Sequence>
      ))}

      <Sequence playbackRate={RATE} durationInFrames={TOTAL_FRAMES}>
        <Hook />
        <Charge />
        <ExhibitA />
        <ExhibitB />
        <ExhibitC />
        <Deliberation />
        <Verdict />
        <Lockup />
      </Sequence>
    </AbsoluteFill>
  );
};
