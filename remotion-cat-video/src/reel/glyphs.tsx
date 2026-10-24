import React from "react";
import { palette } from "../facts/palette";

/**
 * thecatcourt — shared glyph set for `src/reel/` (Film 01).
 *
 * Court-record drawing: flat fills, confident line work, gold accent only.
 * No gradients, no shadows, no glow, no emoji, no external assets.
 *
 * Every glyph here is a STATIC shape. Nothing in this file reads the frame,
 * holds state, or randomises. Scenes animate these; the glyphs never animate
 * themselves.
 */

export type GlyphProps = {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
};

// ---------------------------------------------------------------------------
// Mug — profile, breakable into exactly 7 fragments.
//
// The six body fragments tile the body polygon (50,60)-(140,60)-(132,150)-(58,150)
// exactly: cuts are a horizontal seam at y=105 plus vertical cuts at x=80/110
// (top row) and x=84/106 (bottom row). Shared edges are identical coordinates,
// so the reassembled set is pixel-identical to the whole silhouette.
// Fragment 7 is the handle.
// ---------------------------------------------------------------------------

export const MUG_FRAGMENTS: string[] = [
  "M50 60 L80 60 L80 105 L54 105 Z",
  "M80 60 L110 60 L110 105 L80 105 Z",
  "M110 60 L140 60 L136 105 L110 105 Z",
  "M54 105 L84 105 L84 150 L58 150 Z",
  "M84 105 L106 105 L106 150 L84 150 Z",
  "M106 105 L136 105 L132 150 L106 150 Z",
  "M136 76 C168 76 178 90 178 105 C178 121 160 134 131 134 L132 121 C152 121 164 114 164 105 C164 96 155 89 137 89 Z",
];

export const MUG_VIEWBOX = "0 0 200 200";

/** The whole body as one path — same silhouette as fragments 0-5 joined, without seams. */
export const MUG_BODY = "M50 60 L140 60 L132 150 L58 150 Z";

/** The handle — identical to MUG_FRAGMENTS[6]. */
export const MUG_HANDLE = MUG_FRAGMENTS[6];

/** Whole mug at rest. Same silhouette as MUG_FRAGMENTS drawn together, seam-free. */
export const Mug: React.FC<GlyphProps> = ({
  size = 200,
  color = palette.textPrimary,
  style,
}) => (
  <svg width={size} height={size} viewBox={MUG_VIEWBOX} style={style}>
    <path d={MUG_BODY} fill={color} />
    <path d={MUG_HANDLE} fill={color} />
  </svg>
);

// ---------------------------------------------------------------------------
// Paw underside — Exhibit A.
// Outline is ONE continuous closed path so a scene can stroke-dash reveal it
// without measuring in the DOM (use PAW_OUTLINE_LENGTH).
// Pads are separate so they can be drawn after the outline, and
// PAW_PAD_CENTERS lets a scene scatter receptor dots inside them.
// ---------------------------------------------------------------------------

export const PAW_VIEWBOX = "0 0 200 200";

export const PAW_OUTLINE =
  "M54 150 C36 128 32 104 48 94 A14 17 0 0 1 74 90 A5 5 0 0 0 80 90 " +
  "A14 17 0 0 1 106 86 A5 5 0 0 0 112 86 A14 17 0 0 1 138 92 A5 5 0 0 0 144 94 " +
  "A14 17 0 0 1 168 106 C178 124 168 146 148 155 C124 166 76 166 54 150 Z";

/** Measured once in a headless browser via getTotalLength(). Do not re-measure at runtime. */
export const PAW_OUTLINE_LENGTH = 387.3;

/** Four toe pads then the central plantar pad (index 4). */
export const PAW_PADS: string[] = [
  "M57 106 m-10 0 a10 12 0 1 0 20 0 a10 12 0 1 0 -20 0",
  "M88 100 m-10 0 a10 12 0 1 0 20 0 a10 12 0 1 0 -20 0",
  "M119 103 m-10 0 a10 12 0 1 0 20 0 a10 12 0 1 0 -20 0",
  "M149 116 m-10 0 a10 12 0 1 0 20 0 a10 12 0 1 0 -20 0",
  "M72 134 C72 118 87 111 104 111 C121 111 137 118 137 134 C137 150 121 157 104 157 C87 157 72 150 72 134 Z",
];

export const PAW_PAD_CENTERS: { x: number; y: number }[] = [
  { x: 57, y: 106 },
  { x: 88, y: 100 },
  { x: 119, y: 103 },
  { x: 149, y: 116 },
  { x: 104, y: 134 },
];

export const Paw: React.FC<GlyphProps & { padColor?: string }> = ({
  size = 200,
  color = palette.gold,
  padColor = palette.goldDim,
  style,
}) => (
  <svg width={size} height={size} viewBox={PAW_VIEWBOX} style={style}>
    <path
      d={PAW_OUTLINE}
      fill="none"
      stroke={color}
      strokeWidth={5}
      strokeLinejoin="round"
    />
    {PAW_PADS.map((d, i) => (
      <path key={i} d={d} fill={padColor} />
    ))}
  </svg>
);

// ---------------------------------------------------------------------------
// Paw silhouette — solid side-on forelimb, striking toward frame-LEFT.
// Used for the hook strike and as the travelling glyph on the Exhibit B track.
// ---------------------------------------------------------------------------

export const PAW_SILHOUETTE_VIEWBOX = "0 0 200 120";

export const PAW_SILHOUETTE_PATH =
  "M200 6 L200 104 L42 104 C26 104 16 96 18 84 " +
  "A11 11 0 0 1 30 64 A11 11 0 0 1 48 46 A11 11 0 0 1 72 34 " +
  "C104 18 150 8 200 6 Z";

export const PawSilhouette: React.FC<GlyphProps> = ({
  size = 200,
  color = palette.gold,
  style,
}) => (
  <svg
    width={size}
    height={(size * 120) / 200}
    viewBox={PAW_SILHOUETTE_VIEWBOX}
    style={style}
  >
    <path d={PAW_SILHOUETTE_PATH} fill={color} />
  </svg>
);

// ---------------------------------------------------------------------------
// Cat head — line art for the defendant slot. Record-book plain.
// ---------------------------------------------------------------------------

export const CatHead: React.FC<GlyphProps & { strokeWidth?: number }> = ({
  size = 200,
  color = palette.textPrimary,
  strokeWidth = 5,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <g
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      strokeLinecap="round"
    >
      {/* head + ears, one continuous contour */}
      <path
        d="M44 76 L38 30 L82 56 C94 52 106 52 118 56 L162 30 L156 76
           C168 96 168 124 152 142 C134 162 66 162 48 142 C32 124 32 96 44 76 Z"
      />
      {/* eyes: two short vertical slits, no pupils, no whiskers */}
      <path d="M78 100 V114" />
      <path d="M122 100 V114" />
      {/* nose */}
      <path d="M92 130 L100 138 L108 130" />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Gavel — solid silhouette. Drawn cocked up-left; scenes rotate it to strike.
// ---------------------------------------------------------------------------

export const Gavel: React.FC<GlyphProps> = ({
  size = 200,
  color = palette.gold,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 200" style={style}>
    <g fill={color}>
      {/* head */}
      <rect x={28} y={36} width={104} height={48} rx={8} />
      {/* end bands */}
      <rect x={18} y={28} width={14} height={64} rx={4} />
      <rect x={128} y={28} width={14} height={64} rx={4} />
      {/* neck + handle running down-right */}
      <path d="M72 84 L96 84 L150 162 L126 178 Z" />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Eye — cat eye with a vertical slit pupil. `closed` swaps to a shut lid.
// ---------------------------------------------------------------------------

export const Eye: React.FC<GlyphProps & { closed?: boolean }> = ({
  size = 200,
  color = palette.gold,
  closed = false,
  style,
}) => (
  <svg width={size} height={size} viewBox="0 0 200 120" style={style}>
    {closed ? (
      <g fill="none" stroke={color} strokeWidth={6} strokeLinecap="round">
        <path d="M20 54 C60 92 140 92 180 54" />
        <path d="M44 78 L36 96" />
        <path d="M100 90 L100 110" />
        <path d="M156 78 L164 96" />
      </g>
    ) : (
      <>
        <path
          d="M20 60 C60 16 140 16 180 60 C140 104 60 104 20 60 Z"
          fill="none"
          stroke={color}
          strokeWidth={6}
          strokeLinejoin="round"
        />
        {/* vertical slit pupil */}
        <path
          d="M100 24 C110 38 110 82 100 96 C90 82 90 38 100 24 Z"
          fill={color}
        />
      </>
    )}
  </svg>
);

// ---------------------------------------------------------------------------
// Stamp ring — verdict stamp. Band of two concentric ellipses; the middle is
// left open so type reads through it. Designed to sit at ~8° over the verdict.
// ---------------------------------------------------------------------------

export const STAMP_RING_VIEWBOX = "0 0 320 200";

export const StampRing: React.FC<GlyphProps & { strokeWidth?: number }> = ({
  size = 320,
  color = palette.gold,
  strokeWidth = 9,
  style,
}) => (
  <svg
    width={size}
    height={(size * 200) / 320}
    viewBox={STAMP_RING_VIEWBOX}
    style={style}
  >
    <g fill="none" stroke={color} strokeWidth={strokeWidth}>
      <ellipse cx={160} cy={100} rx={150} ry={88} />
      <ellipse
        cx={160}
        cy={100}
        rx={134}
        ry={72}
        strokeWidth={strokeWidth / 2}
      />
    </g>
  </svg>
);

// ---------------------------------------------------------------------------
// Sound arc — one stroke. Used in threes, pulsing out of the Exhibit C box.
// Opens to the right; mirror with scaleX(-1) for the left side.
// ---------------------------------------------------------------------------

export const SOUND_ARC_PATH = "M20 14 C56 38 56 82 20 106";

/** Measured once in a headless browser via getTotalLength(). */
export const SOUND_ARC_LENGTH = 111.2;

export const SoundArc: React.FC<GlyphProps & { strokeWidth?: number }> = ({
  size = 80,
  color = palette.gold,
  strokeWidth = 7,
  style,
}) => (
  <svg
    width={size}
    height={(size * 120) / 80}
    viewBox="0 0 80 120"
    style={style}
  >
    <path
      d={SOUND_ARC_PATH}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
    />
  </svg>
);
