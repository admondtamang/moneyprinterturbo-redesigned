// thecatcourt — Film 01, "The State v. The Cat".
// 1080x1920 @ 60fps, 1320 frames (11 bars @ 120 BPM). See docs/shotlist.md for the beat table.
//
// Structure note: acts are NOT wrapped in <Sequence>. Every act reads the GLOBAL frame and
// windows itself off beat()/bar(), because the film's transitions deliberately overlap — the
// hook's mug fragments become the charge panel, the charge panel becomes Exhibit A's card.
// "One container never cuts" (docs/motion-rules.md) only works if acts share one timeline.
import { Audio } from "@remotion/media";
import { AbsoluteFill, staticFile } from "remotion";
import { palette } from "../facts/palette";
import { Hook } from "./acts/Hook";
import { Charge } from "./acts/Charge";
import { ExhibitA } from "./acts/ExhibitA";
import { ExhibitB } from "./acts/ExhibitB";
import { ExhibitC } from "./acts/ExhibitC";
import { Deliberation } from "./acts/Deliberation";
import { Verdict } from "./acts/Verdict";
import { Lockup } from "./acts/Lockup";

export const TheCatCourt01: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      {/* Score + SFX, synthesised at 120 BPM to the same grid the picture uses.
          Already mastered to -14 LUFS by scripts/generate-score.sh — do not re-gain here. */}
      <Audio src={staticFile("audio/thecatcourt-01.mp3")} />
      <Hook />
      <Charge />
      <ExhibitA />
      <ExhibitB />
      <ExhibitC />
      <Deliberation />
      <Verdict />
      <Lockup />
    </AbsoluteFill>
  );
};
