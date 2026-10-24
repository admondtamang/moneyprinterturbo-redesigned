// Hook — beats 0-3. See docs/shotlist.md §3 rows 0-3 and §2.1 for the copy.
//
// Frame 0 is the loop's downbeat, so the opening tableau is read entirely from STAGE
// (src/reel/stage.ts) — the Lockup act reproduces the same tableau at beat 43. Nothing here
// invents a coordinate and nothing here hardcodes a frame.
//
// This act also owns the SHATTER half of the hook/charge seam. At beat 3 the mug breaks into
// MUG_FRAGMENTS (exactly 7 pieces) and `fragmentState()` below is the ONE formula that carries
// those pieces from their shatter positions all the way into the charge panel rectangle.
// Hook draws them up to beat 4; Charge.tsx imports the same function and draws them from beat 4
// on, so the two acts cannot drift and the container never cuts.
import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beat } from "../beats";
import { FIRM, slam, springAt, sumSprings } from "../motion";
import { H, LOOP_PAW_PX_PER_FRAME, SAFE, STAGE, TABLE_STROKE, W, pawX } from "../stage";
import {
  MUG_BODY,
  MUG_FRAGMENTS,
  MUG_HANDLE,
  PAW_SILHOUETTE_PATH,
} from "../glyphs";
import { palette } from "../../facts/palette";
import { serif } from "../../facts/fonts";

export const FROM_BEAT = 0;
export const TO_BEAT = 3;

/** Beat 3: the mug meets the bottom edge and breaks. Beat 4: the pieces magnetise into the panel. */
export const SHATTER = beat(TO_BEAT);
export const COLLAPSE = beat(TO_BEAT + 1);

/** The charge panel the 7 fragments become. Charge.tsx lays its content out against this. */
export const PANEL = { x: 72, y: 250, w: 848, h: 1070 } as const;
/** Horizontal seam the panel splits on at beat 10, as an offset from PANEL.y. */
export const PANEL_SEAM = 700;

const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/**
 * Tableau magnification. STAGE.mugSize is the glyph's BOX; the drawn body is only 90 of its 200
 * viewBox units, so an unscaled mug is 117px tall — debris, not a mug, at 360px. This factor is
 * exported because Lockup must reproduce the frame-0 tableau at beat 43: both acts scale by it.
 * It deliberately does NOT touch the paw, which stays on pawX() so the loop velocity is untouched.
 */
export const TABLEAU = 2.4;

const MUG_SCALE = (STAGE.mugSize / 200) * TABLEAU; // viewBox units -> composition px
const MUG_BASE = { x: 95, y: 150 };    // centre of the mug's base, viewBox units
const MUG_CENTRE = { x: 95, y: 105 };  // centroid of the body, viewBox units
const MUG_RIM = { x: 50, y: 60 };      // the rim corner whose sweep draws the trajectory arc

const PAW_SCALE = STAGE.pawSize / 200;
/** Frames the paw has already been travelling by frame 0. Derived, so the loop stays honest. */
const PAW_ENTRY =
  (STAGE.pawOffstage.x - STAGE.pawContact.x) / LOOP_PAW_PX_PER_FRAME;

/** Mug base y during the fall. Gravity, not a spring — it meets the bottom edge on beat 3. */
const fallY = (frame: number) =>
  interpolate(frame, [beat(0), SHATTER], [STAGE.mugRest.y, H - 45 * MUG_SCALE], {
    easing: Easing.in(Easing.quad),
    ...CLAMP,
  });

/** Topple angle, degrees. ~90° by beat 2 (shotlist row 2) and still turning through the fall. */
const topple = (frame: number) =>
  interpolate(frame, [beat(0), SHATTER], [0, 130], CLAMP);

const rotate = (x: number, y: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return {
    x: x * Math.cos(a) - y * Math.sin(a),
    y: x * Math.sin(a) + y * Math.cos(a),
  };
};

// --- fragment geometry -----------------------------------------------------
// MUG_FRAGMENTS 0-5 already tile the mug body as a 3x2 grid (glyphs.tsx), so the panel is
// tiled by the same grid: fragment i lands on column i%3, row floor(i/3). Fragment 6 is the
// handle, which has no cell — it collapses to the panel centre.
// The two rows are cut at different x positions (glyphs.tsx): 80/110 on the top row, 84/106 on
// the bottom. Using one column list for both would leave seams, so each row carries its own.
const COLS_BY_ROW = [
  [50, 80, 110, 140],
  [54, 84, 106, 136],
];
const ROWS = [60, 105, 150];
/** Outward over-cover, px. The mug body is a trapezoid; the outer columns are stretched past the
 *  panel edge and FRAGMENT_CLIP trims them back, so the assembled shape is a true rectangle. */
const OVER = 96;

const FRAG = MUG_FRAGMENTS.map((_, i) => {
  if (i === 6) {
    return {
      anchor: { x: 155, y: 105 },
      cell: { x: PANEL.x + PANEL.w / 2, y: PANEL.y + PANEL.h / 2 },
      target: { sx: 0.001, sy: 0.001 },
    };
  }
  const col = i % 3;
  const row = Math.floor(i / 3);
  const cols = COLS_BY_ROW[row];
  const w = cols[col + 1] - cols[col];
  const h = ROWS[row + 1] - ROWS[row];
  const cw = PANEL.w / 3;
  const ch = PANEL.h / 2;
  const outward = col === 1 ? 0 : (col === 0 ? -OVER : OVER) / 2;
  return {
    anchor: { x: cols[col] + w / 2, y: ROWS[row] + h / 2 },
    cell: {
      x: PANEL.x + cw * (col + 0.5) + outward,
      y: PANEL.y + ch * (row + 0.5),
    },
    target: { sx: (cw + (col === 1 ? 0 : OVER)) / w, sy: (ch + 8) / h },
  };
});

/** Where each piece flies on beat 3. Seeded — frame-pure, identical on every render. */
const SCATTER = FRAG.map((f, i) => {
  const dx = f.anchor.x - MUG_CENTRE.x;
  const dy = f.anchor.y - MUG_CENTRE.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  return {
    x: (dx / len) * (220 + 260 * random(`frag-x-${i}`)),
    y: -(260 + 320 * random(`frag-y-${i}`)),
    spin: (random(`frag-r-${i}`) - 0.5) * 340,
  };
});

const toRgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const MUG_RGB = toRgb(palette.textPrimary);
const PANEL_RGB = toRgb(palette.panel);

export type FragmentState = { transform: string; fill: string };

/**
 * Position/rotation/scale/fill of fragment `i` at `frame`, as the SUM of one spring per change
 * (docs/motion-rules.md § Motion): one spring outward on beat 3, one spring into its panel cell
 * on beat 4. Shared by Hook (beats 3-4) and Charge (beats 4-5) so the seam is continuous.
 */
export const fragmentState = (
  frame: number,
  fps: number,
  i: number,
): FragmentState => {
  const f = FRAG[i];
  const s = SCATTER[i];
  const theta = topple(SHATTER);
  const local = rotate(
    (f.anchor.x - MUG_BASE.x) * MUG_SCALE,
    (f.anchor.y - MUG_BASE.y) * MUG_SCALE,
    theta,
  );
  const x0 = STAGE.mugRest.x + local.x;
  const y0 = fallY(SHATTER) + local.y;

  const x = sumSprings(frame, fps, x0, [
    { at: SHATTER, delta: s.x },
    { at: COLLAPSE, delta: f.cell.x - x0 - s.x, config: FIRM },
  ]);
  const y = sumSprings(frame, fps, y0, [
    { at: SHATTER, delta: s.y },
    { at: COLLAPSE, delta: f.cell.y - y0 - s.y, config: FIRM },
  ]);
  const r = sumSprings(frame, fps, theta, [
    { at: SHATTER, delta: s.spin },
    { at: COLLAPSE, delta: -(theta + s.spin), config: FIRM },
  ]);
  const grow = COLLAPSE + 8;
  const sx = sumSprings(frame, fps, MUG_SCALE, [
    { at: grow, delta: f.target.sx - MUG_SCALE, config: FIRM },
  ]);
  const sy = sumSprings(frame, fps, MUG_SCALE, [
    { at: grow, delta: f.target.sy - MUG_SCALE, config: FIRM },
  ]);

  // The pieces stay mug-coloured while they fly and only take the panel's fill as they land,
  // so the collapse reads as one object changing, not a crossfade.
  const t = interpolate(frame, [COLLAPSE + 10, COLLAPSE + 24], [0, 1], CLAMP);
  const fill = `rgb(${MUG_RGB.map((c, k) =>
    Math.round(c + (PANEL_RGB[k] - c) * t),
  ).join(",")})`;

  return {
    transform: `translate(${x} ${y}) rotate(${r}) scale(${sx} ${sy}) translate(${-f.anchor.x} ${-f.anchor.y})`,
    fill,
  };
};

/**
 * Clip rect for the fragment group. Wide open while the pieces fly, closing onto PANEL exactly as
 * they land — this is what turns the mug's trapezoid silhouette into the panel's square corners.
 * Both acts render it so the seam stays continuous.
 */
export const fragmentClip = (frame: number, fps: number) => {
  const m = 2400 * (1 - springAt(frame, fps, COLLAPSE + 10, FIRM));
  return {
    x: PANEL.x - m,
    y: PANEL.y - m,
    width: PANEL.w + m * 2,
    height: PANEL.h + m * 2,
  };
};

/** The swept path of the mug's rim corner — a real trajectory, not a decorative curve. */
const arcPath = (frame: number) => {
  const pts: string[] = [];
  for (let f = 0; f <= Math.min(frame, SHATTER); f += 3) {
    const p = rotate(
      (MUG_RIM.x - MUG_BASE.x) * MUG_SCALE,
      (MUG_RIM.y - MUG_BASE.y) * MUG_SCALE,
      topple(f),
    );
    pts.push(
      `${(STAGE.mugRest.x + p.x).toFixed(1)},${(fallY(f) + p.y).toFixed(1)}`,
    );
  }
  return pts.length > 1 ? `M${pts.join(" L")}` : "";
};

// `IT` / `DID NOT` / `FALL` — shotlist §2.1. FALL lands on the frame the mug lands.
const LINES = [
  { text: "IT", at: beat(1) },
  { text: "DID NOT", at: beat(2) },
  { text: "FALL", at: beat(3) },
];

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Widened past beat 3: the type has to survive into beat 4 so the growing panel can wipe it.
  if (frame < beat(FROM_BEAT) || frame >= COLLAPSE + 36) return null;

  const beforeCollapse = frame < COLLAPSE;
  const showMug = frame < SHATTER;
  const showFragments = frame >= SHATTER && frame < COLLAPSE;

  // Beat 3: the whole type block jolts 2px as the mug hits.
  const jolt = interpolate(frame, [SHATTER, SHATTER + 2, SHATTER + 8], [0, 2, 0], CLAMP);
  // Beat 4: the arriving panel wipes the hook type top-down; what survives longest sits inside
  // the panel footprint, so there is never an orphan sliver above it.
  const wipe = springAt(frame, fps, COLLAPSE + 10, FIRM);

  // Linear approach at LOOP_PAW_PX_PER_FRAME (the loop contract is on velocity, not just
  // position), plus one spring that pulls the paw back out to the right after the strike.
  const paw = sumSprings(frame, fps, pawX(frame + PAW_ENTRY), [
    { at: beat(0.5), delta: 1100 },
  ]);

  return (
    <AbsoluteFill>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{ position: "absolute", left: 0, top: 0 }}
      >
        {beforeCollapse ? (
          <path
            d={`M0 ${STAGE.tableY} H${STAGE.tableEdgeX}`}
            stroke={palette.textMuted}
            strokeWidth={TABLE_STROKE}
            fill="none"
          />
        ) : null}
        {frame >= beat(1) && frame <= SHATTER ? (
          <path
            d={arcPath(frame)}
            fill="none"
            stroke={palette.gold}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ) : null}
        {showMug ? (
          <g
            transform={`translate(${STAGE.mugRest.x} ${fallY(frame)}) rotate(${topple(
              frame,
            )}) scale(${MUG_SCALE}) translate(${-MUG_BASE.x} ${-MUG_BASE.y})`}
            fill={palette.textPrimary}
          >
            <path d={MUG_BODY} />
            <path d={MUG_HANDLE} />
          </g>
        ) : null}
        {showFragments ? (
          <>
            <defs>
              <clipPath id="hook-frag-clip">
                <rect {...fragmentClip(frame, fps)} />
              </clipPath>
            </defs>
            <g clipPath="url(#hook-frag-clip)">
              {MUG_FRAGMENTS.map((d, i) => {
                const st = fragmentState(frame, fps, i);
                return <path key={i} d={d} transform={st.transform} fill={st.fill} />;
              })}
            </g>
          </>
        ) : null}
        {beforeCollapse ? (
          <g transform={`translate(${paw} ${STAGE.pawOffstage.y}) scale(${PAW_SCALE})`}>
            <path d={PAW_SILHOUETTE_PATH} fill={palette.gold} />
          </g>
        ) : null}
      </svg>

      <div
        style={{
          position: "absolute",
          left: SAFE.left,
          top: 270,
          width: W - SAFE.left - SAFE.right,
          transform: `translateY(${jolt}px)`,
          clipPath: `inset(${wipe * 100}% 0 0 0)`,
        }}
      >
        {LINES.map((l) => {
          const s = slam(frame, fps, l.at);
          return (
            <div
              key={l.text}
              style={{
                fontFamily: serif,
                fontWeight: 900,
                fontSize: 182,
                lineHeight: 0.94,
                letterSpacing: -6,
                color: palette.textPrimary,
                transform: s.transform,
                transformOrigin: "0% 0%",
                // Not a fade: the line simply does not exist until its beat, then it slams.
                visibility: frame >= l.at ? "visible" : "hidden",
              }}
            >
              {l.text}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
