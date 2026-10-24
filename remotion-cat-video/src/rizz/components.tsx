import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { createTikTokStyleCaptions, type Caption } from "@remotion/captions";
import { VOICEOVER_DIR } from "./script";
import { loadFont as loadNunito } from "@remotion/google-fonts/Nunito";
import { palette } from "../facts/palette";

export const { fontFamily } = loadNunito("normal", {
  weights: ["800"],
  subsets: ["latin"],
});

// One page per spoken phrase. 1200ms is the Remotion default and matches the
// ~4-word bursts these scripts are written in.
export const toPages = (captions: Caption[]) =>
  createTikTokStyleCaptions({
    // Force a page break after sentence-ending punctuation. Time-based paging
    // alone strands a sentence's last word at the head of the next page
    // ("a test. Gravity"), which reads as mistimed even though it isn't.
    captions: captions.map((caption) => ({
      ...caption,
      pageBreakAfter: /[.?!]$/.test(caption.text.trim()),
    })),
    combineTokensWithinMilliseconds: 1200,
  }).pages;

export type MouthCue = { start: number; end: number; value: string };

// Rhubarb basic set. G/H/X are not generated — see scripts/lipsync-rizz.mts.
const MOUTH_SHAPES = ["A", "B", "C", "D", "E", "F"] as const;

export const Mascot: React.FC<{
  width?: number;
  cues?: MouthCue[];
  /** Mirror horizontally so he angles into frame from the opposite corner. */
  flip?: boolean;
}> = ({ width = 384, cues, flip = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const seconds = frame / fps;

  const entry = spring({ frame, fps, config: { damping: 14, mass: 0.7 } });
  // Idle bob — a few pixels, plus a matching squash so it reads as weight
  // rather than a sliding sprite.
  const bob = Math.sin(seconds * Math.PI * 2 * 0.8);

  const active =
    cues?.find((cue) => cue.start <= seconds && seconds < cue.end)?.value ?? "A";

  return (
    <div
      style={{
        position: "relative",
        width,
        transform: [
          `scale(${interpolate(entry, [0, 1], [0.8, 1])})`,
          `translateY(${bob * 14}px)`,
          `scaleY(${1 - bob * 0.015})`,
          flip ? "scaleX(-1)" : "",
        ].join(" "),
      }}
    >
      {/* Every shape is mounted and toggled by opacity. Swapping the src
          instead would decode the new sprite mid-render and flash. Bodies are
          byte-identical across the set, so only the mouth appears to move. */}
      {MOUTH_SHAPES.map((shape, index) => (
        <Img
          key={shape}
          src={staticFile(`mascot/rizz-mouth-${shape}.png`)}
          style={{
            width: "100%",
            display: "block",
            opacity: shape === active ? 1 : 0,
            ...(index === 0
              ? {}
              : { position: "absolute", top: 0, left: 0 }),
          }}
        />
      ))}
    </div>
  );
};

// Confirmed caption geometry from the CLI recipe: 63% from the top, sentence
// case, heavy weight over a stroke. See root CLAUDE.md.
export const Karaoke: React.FC<{
  captions: Caption[];
  topPercent?: number;
  fontSize?: number;
}> = ({ captions, topPercent = 63, fontSize = 86 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentMs = (frame / fps) * 1000;

  const page = toPages(captions).find(
    (candidate) =>
      candidate.startMs <= currentMs &&
      currentMs < candidate.startMs + candidate.durationMs,
  );

  if (!page) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: `${topPercent}%`,
        left: 0,
        right: 0,
        padding: "0 90px",
        textAlign: "center",
        fontFamily,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.15,
        color: palette.textPrimary,
        WebkitTextStroke: `10px ${palette.background}`,
        paintOrder: "stroke fill",
        whiteSpace: "pre-wrap",
      }}
    >
      {page.tokens.map((token) => {
        const isSpoken = token.fromMs <= currentMs && currentMs < token.toMs;
        return (
          <span
            key={`${token.fromMs}-${token.toMs}`}
            style={{
              color: isSpoken ? palette.gold : palette.textPrimary,
              display: "inline-block",
              transform: `scale(${isSpoken ? 1.08 : 1})`,
            }}
          >
            {token.text}
          </span>
        );
      })}
    </div>
  );
};

/** The plain Rizz-short layout: karaoke captions, lip-synced mascot bottom-right.
    The explainer does not use this — it has its own step strip. */
export const Short: React.FC<{
  captions: Caption[];
  cues: MouthCue[];
  /** Voiceover slug, e.g. "rizz" -> voiceover/rizz/rizz.mp3 */
  slug: string;
}> = ({ captions, cues, slug }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.background }}>
      <Karaoke captions={captions} topPercent={63} />

      {/* Bottom-right, mirrored so he angles into frame. */}
      <div style={{ position: "absolute", right: 40, bottom: 0 }}>
        <Mascot width={430} cues={cues} flip />
      </div>

      <Audio src={staticFile(`voiceover/${VOICEOVER_DIR}/${slug}.mp3`)} />
      <Audio src={staticFile("audio/background.mp3")} volume={0.12} loop />
    </AbsoluteFill>
  );
};
