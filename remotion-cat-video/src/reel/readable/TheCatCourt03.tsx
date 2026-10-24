// thecatcourt — Film 03: the readable cut. 1080x1920 @ 60fps, 3600 frames = 60.0s.
//
// WHY THIS FILM LOOKS NOTHING LIKE 01/02.
// The client's verdict on both earlier cuts was "too fast, I can't read, some screens just go
// off" and "the whole design guidelines, it's very boring and brownish". Those are two faults:
// event density, and palette. This file fixes density; ../paperPalette.ts fixes palette.
//
// THE SHAPE. One <Sequence> per moment in ../moments.ts — 11 pages of one document. Every
// timing and every word comes from that file; nothing here hardcodes either. Each page:
//   frame 3        entrance begins (a 0.4s left-to-right wipe, the way a document prints)
//   ~frame 46      fully settled
//   .. dur-8       COMPLETELY STILL. Nothing moves while the viewer is reading. This is the
//                  whole point of the cut and docs/readable-rules.md bans everything that
//                  would break it (drifting grounds, breathing icons, counting numerals).
//   last 8 frames  the page wipes away, left to right, into the next one.
//
// Stillness is a property of the construction, not of discipline: after the wipe clip-paths
// reach 1 every value on screen is a constant. The only frame-dependent values in this file are
// the entrance wipes and the exit wipe.
//
// The document furniture (masthead, rules, register marks) is deliberately IDENTICAL across
// consecutive moments, so the cut reads as the page turning rather than the film restarting.
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { paper } from "../paperPalette";
import { maskReveal } from "../motion";
import { FPS, MOMENTS, TOTAL_FRAMES, atSeconds, type Moment } from "../moments";
import {
  DocumentFrame,
  Headline,
  PAGE,
  PaperBackground,
  Rule,
  Slug,
  Stamp,
  TextBlock,
} from "./chrome";
import {
  MUG_BODY,
  MUG_FRAGMENTS,
  MUG_HANDLE,
  MUG_VIEWBOX,
  PAW_PAD_CENTERS,
  Paw,
  PawSilhouette,
  CatHead,
  SoundArc,
} from "../glyphs";

export const FILM03_FRAMES = TOTAL_FRAMES;

/** Frame, within a moment, at which the entrance starts. A beat of paper before the ink. */
const ENTER = 3;
/** Imagery prints just after its text block, so the claim leads its illustration. */
const ART = ENTER + 10;
/** Exit wipe length. Short: the page is already read by the time it leaves. */
const EXIT = 8;

// ---------------------------------------------------------------------------
// Two primitives this file adds on top of chrome: a wipe for non-text artwork,
// and the page-exit. Everything else comes from chrome.tsx.
// ---------------------------------------------------------------------------

/** Artwork arrives the same way type does — printed left to right, then frozen. */
const Printed: React.FC<{
  at: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { clipPath } = maskReveal(frame, fps, at, 24);
  return (
    <div style={{ position: "absolute", clipPath, ...style }}>{children}</div>
  );
};

/** Knockout panel: artwork clears the body ruling behind it, like TextBlock does for type. */
const Plate: React.FC<{
  at: number;
  top: number;
  height: number;
  children: React.ReactNode;
}> = ({ at, top, height, children }) => (
  <Printed
    at={at}
    style={{
      left: PAGE.colLeft,
      top,
      width: PAGE.colWidth,
      height,
      backgroundColor: paper.bg,
    }}
  >
    {children}
  </Printed>
);

/** The page itself leaves; the furniture under it is replaced by the next moment's. */
const PageExit: React.FC<{ frames: number; children: React.ReactNode }> = ({
  frames,
  children,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [frames - EXIT, frames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <AbsoluteFill style={{ clipPath: `inset(0% 0% 0% ${p * 100}%)` }}>
      {children}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Glyph placement helpers. Pure geometry, no frame.
// ---------------------------------------------------------------------------

/** The mug sits ON a surface: (x, y) is the centre of its BASE, not of its box. */
const MugAt: React.FC<{
  x: number;
  y: number;
  size: number;
  color?: string;
  blur?: number;
}> = ({ x, y, size, color = paper.ink, blur = 0 }) => {
  const k = size / 200;
  return (
    <svg
      width={size}
      height={size}
      viewBox={MUG_VIEWBOX}
      style={{
        position: "absolute",
        left: x - 95 * k,
        top: y - 150 * k,
        filter: blur ? `blur(${blur}px)` : undefined,
      }}
    >
      <path d={MUG_BODY} fill={color} />
      <path d={MUG_HANDLE} fill={color} />
    </svg>
  );
};

/** Horizontal hairline-free surface rule — the table edge, drawn in ink at document weight. */
const Surface: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: w,
      height: 8,
      backgroundColor: paper.ink,
    }}
  />
);

/** Dashed measure line in the data voice. Vertical or horizontal. */
const Dashed: React.FC<{
  x: number;
  y: number;
  length: number;
  vertical?: boolean;
}> = ({ x, y, length, vertical }) => (
  <div
    style={{
      position: "absolute",
      left: x,
      top: y,
      width: vertical ? 0 : length,
      height: vertical ? length : 0,
      borderTop: vertical ? undefined : `3px dashed ${paper.ink2}`,
      borderLeft: vertical ? `3px dashed ${paper.ink2}` : undefined,
    }}
  />
);

// ---------------------------------------------------------------------------
// m01 — THE HOOK. The mug and the table edge: the single strongest image in the
// film, and it gets 6 seconds. The hook is set as three fragments (type-scale.md
// "Hook fragments", 150-190) because one 15-character line does not fit 856px.
// The dashed line is the fall that did not happen — static, in the data ink.
// ---------------------------------------------------------------------------
const Hook: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    {(m.headline ?? "").split(" ").reduce<string[][]>(
      // "IT DID NOT FALL" -> IT / DID NOT / FALL. Derived from the copy, never retyped.
      (acc, w, i) => {
        const line = i === 0 ? 0 : i < 3 ? 1 : 2;
        acc[line] = [...(acc[line] ?? []), w];
        return acc;
      },
      [],
    ).map((line, i) => (
      <Headline
        key={line.join("-")}
        at={ENTER}
        size={176}
        style={{ position: "absolute", left: PAGE.colLeft, top: 330 + i * 168 }}
      >
        {line.join(" ")}
      </Headline>
    ))}

    <Printed at={ART} style={{ left: 0, top: 0, width: 1080, height: 1920 }}>
      <Surface x={PAGE.colLeft} y={1150} w={442} />
      <MugAt x={470} y={1150} size={310} />
      <Dashed x={470} y={1166} length={140} vertical />
      <div
        style={{
          position: "absolute",
          left: 440,
          top: 1306,
          width: 60,
          height: 3,
          backgroundColor: paper.ink2,
        }}
      />
    </Printed>
  </>
);

// ---------------------------------------------------------------------------
// m02 — THE CASE. Masthead treatment: the case name set as a filed record, with
// the court's seal pressed below it. The docket rides in the data ink.
// ---------------------------------------------------------------------------
const CaseHeader: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <Rule
      at={ENTER}
      width={PAGE.colWidth}
      thickness={6}
      color={paper.ink}
      style={{ position: "absolute", left: PAGE.colLeft, top: 400 }}
    />
    <TextBlock
      at={ENTER + 2}
      top={450}
      size={66}
      headline={m.headline}
      detail={
        <span style={{ color: paper.ink2, letterSpacing: "0.18em" }}>
          {m.detail}
        </span>
      }
    />
    <Plate at={ART} top={900} height={420}>
      <div
        style={{
          position: "absolute",
          left: 268,
          top: 20,
          width: 320,
          height: 320,
          border: `3px solid ${paper.rule}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 272,
            height: 272,
            border: `2px solid ${paper.rule}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CatHead size={200} color={paper.ink} strokeWidth={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 268, top: 362 }}>
        <Slug>Seal of the court</Slug>
      </div>
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m03 — THE CHARGE. "Wilful displacement" drawn as displacement: the mug's seven
// fragments pulled apart on fixed, deterministic offsets. Static — it is an
// exploded diagram in an evidence file, not an explosion.
// ---------------------------------------------------------------------------
const FRAGMENT_OFFSETS: [number, number][] = [
  [-10, -5],
  [0, -10],
  [10, -5],
  [-13, 6],
  [0, 12],
  [13, 6],
  [19, 1],
];

const Charge: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <TextBlock
      at={ENTER}
      top={420}
      size={70}
      headline={m.headline}
      detail={m.detail}
    />
    <Plate at={ART} top={880} height={440}>
      <svg
        width={440}
        height={440}
        viewBox="0 0 200 200"
        style={{ position: "absolute", left: 208, top: 0 }}
      >
        {MUG_FRAGMENTS.map((d, i) => (
          <path
            key={d}
            d={d}
            fill={paper.ink}
            transform={`translate(${FRAGMENT_OFFSETS[i][0]},${FRAGMENT_OFFSETS[i][1]})`}
          />
        ))}
      </svg>
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m04 — EXHIBIT A. The paw as an instrument: the glyph, with its receptors
// called out in the data ink and a reading-depth bracket under the central pad.
// ---------------------------------------------------------------------------
const PAW_BOX = (() => {
  // Paw ink occupies viewBox x 32-178, y 86-166 — the rest of the 200x200 box is air.
  const size = 680;
  const k = size / 200;
  const inkW = 146 * k;
  return { size, left: (PAGE.colWidth - inkW) / 2 - 32 * k, top: 40 - 86 * k };
})();

const ExhibitPaw: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <TextBlock
      at={ENTER}
      top={372}
      label={m.label}
      headline={m.headline}
      detail={m.detail}
    />
    <Plate at={ART} top={880} height={400}>
      <div style={{ position: "absolute", left: PAW_BOX.left, top: PAW_BOX.top }}>
        <Paw size={PAW_BOX.size} color={paper.ink} padColor={paper.bgAlt} />
        <svg
          width={PAW_BOX.size}
          height={PAW_BOX.size}
          viewBox="0 0 200 200"
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          {PAW_PAD_CENTERS.map((c, i) => (
            <circle
              key={`${c.x}-${c.y}`}
              cx={c.x}
              cy={c.y}
              r={i === 4 ? 6 : 4}
              fill={paper.ink2}
            />
          ))}
          <circle
            cx={104}
            cy={134}
            r={18}
            fill="none"
            stroke={paper.ink2}
            strokeWidth={2}
          />
          <circle
            cx={104}
            cy={134}
            r={26}
            fill="none"
            stroke={paper.ink2}
            strokeWidth={1.5}
          />
        </svg>
      </div>
      <div style={{ position: "absolute", left: 0, top: 352 }}>
        <Slug tone="ink2">Deep pad — vibration receptors</Slug>
      </div>
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m05 — EXHIBIT B. The hunt as a staged sequence: five numbered stations on one
// baseline, the paw standing in station three. The previous cut animated a glyph
// along this track; here the whole sequence is present at once and holds still.
// ---------------------------------------------------------------------------
const ExhibitSequence: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <TextBlock
      at={ENTER}
      top={372}
      label={m.label}
      headline={m.headline}
      detail={m.detail}
    />
    <Plate at={ART} top={900} height={320}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{ position: "absolute", left: i * 176, top: 46 }}>
          <div style={{ marginBottom: 14 }}>
            <Slug tone="ink2">{`0${i + 1}`}</Slug>
          </div>
          <div
            style={{
              width: 150,
              height: 150,
              border: `2px solid ${i === 2 ? paper.ink : paper.rule}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {i === 2 ? (
              <PawSilhouette size={110} color={paper.ink} />
            ) : (
              <div
                style={{
                  width: 54,
                  height: 54,
                  border: `2px solid ${paper.rule}`,
                  borderRadius: 27,
                }}
              />
            )}
          </div>
        </div>
      ))}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 258,
          width: 854,
          height: 2,
          backgroundColor: paper.ink,
        }}
      />
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m06 — EXHIBIT C. The rattle and the predicted fall: sound arcs into the mug,
// a dashed trajectory out to a marked point of impact. The prediction is drawn,
// not played — the arc is a static plot, which is the point of the claim.
// ---------------------------------------------------------------------------
const ExhibitPrediction: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <TextBlock
      at={ENTER}
      top={372}
      label={m.label}
      headline={m.headline}
      detail={m.detail}
    />
    <Plate at={ART} top={880} height={420}>
      <Surface x={0} y={300} w={300} />
      <MugAt x={150} y={300} size={200} />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{ position: "absolute", left: 246 + i * 34, top: 136 }}
        >
          <SoundArc size={56} color={paper.ink2} strokeWidth={8} />
        </div>
      ))}
      <svg width={854} height={420} style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d="M300 300 C400 306 480 330 556 362"
          fill="none"
          stroke={paper.ink2}
          strokeWidth={3}
          strokeDasharray="14 12"
        />
        <circle cx={556} cy={362} r={16} fill="none" stroke={paper.ink2} strokeWidth={3} />
        <circle cx={556} cy={362} r={5} fill={paper.ink2} />
      </svg>
      <div style={{ position: "absolute", left: 596, top: 342 }}>
        <Slug tone="ink2">Impact</Slug>
      </div>
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m07 — THE NUMBER. 25-36 CM, set in the data ink and LANDED, not counted up.
// A counting numeral on a figure the viewer must read is banned by
// docs/readable-rules.md; it is also the one thing nobody can read. Under it,
// the figure as data: a 0-50cm scale with the range band called out.
// ---------------------------------------------------------------------------
const SCALE_MAX = 50;
/** Axis is inset inside the plate: a tick label is centred on its tick and needs ~26px either
 *  side, and the plate clips. 0 and 50 lost a digit before this inset existed. */
const AXIS_X = 34;
const AXIS_W = 786;
const scaleX = (cm: number) => AXIS_X + (cm / SCALE_MAX) * AXIS_W;

const NumberCard: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <TextBlock
      at={ENTER}
      top={430}
      size={160}
      headlineTone="ink2"
      headline={m.headline}
      detail={m.detail}
    />
    <Plate at={ART} top={900} height={220}>
      <div
        style={{
          position: "absolute",
          left: AXIS_X,
          top: 110,
          width: AXIS_W,
          height: 3,
          backgroundColor: paper.ink,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: scaleX(25),
          top: 72,
          width: scaleX(36) - scaleX(25),
          height: 42,
          backgroundColor: paper.bgAlt,
          borderLeft: `4px solid ${paper.ink2}`,
          borderRight: `4px solid ${paper.ink2}`,
          borderTop: `4px solid ${paper.ink2}`,
        }}
      />
      {[0, 10, 20, 30, 40, 50].map((cm) => (
        <div key={cm}>
          <div
            style={{
              position: "absolute",
              left: scaleX(cm),
              top: 113,
              width: 2,
              height: 18,
              backgroundColor: paper.rule,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: scaleX(cm) - 30,
              top: 140,
              width: 60,
              textAlign: "center",
            }}
          >
            <Slug>{cm}</Slug>
          </div>
        </div>
      ))}
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m08 — the consequence of the number. Two mugs at the same size: inside the
// near point and outside it. The blur is a static CSS filter on a hard-edged
// silhouette — no frame-driven value, and nothing near white, so it cannot read
// as the banned glow.
// ---------------------------------------------------------------------------
const BlurCard: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    {(m.headline ?? "").split(" ").reduce<string[][]>((acc, w, i) => {
      const line = i < 2 ? 0 : 1;
      acc[line] = [...(acc[line] ?? []), w];
      return acc;
    }, []).map((line, i) => (
      <Headline
        key={line.join("-")}
        at={ENTER + i * 4}
        size={126}
        style={{ position: "absolute", left: PAGE.colLeft, top: 420 + i * 130 }}
      >
        {line.join(" ")}
      </Headline>
    ))}
    <Plate at={ART} top={820} height={470}>
      <Surface x={0} y={330} w={854} />
      <MugAt x={210} y={330} size={240} blur={11} />
      <MugAt x={650} y={330} size={240} />
      <div style={{ position: "absolute", left: 132, top: 356 }}>
        <Slug tone="ink2">Inside 25 cm</Slug>
      </div>
      <div style={{ position: "absolute", left: 478, top: 356 }}>
        <Slug tone="ink2">Beyond 36 cm</Slug>
      </div>
      <Dashed x={430} y={60} length={250} vertical />
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m09 — THE VERDICT. The stamp sits ABOVE the type, clear of every word: round 2
// failed because an impression centred on the headline bisected it and read as a
// biro loop. Its right edge is checked against PAGE.colRight, which a 64pt stamp
// at left 470 overran by 24px.
// ---------------------------------------------------------------------------
const Verdict: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    <Stamp at={ENTER + 14} size={58} rotate={-7} seed="verdict" style={{ left: 150, top: 470 }}>
      Verdict
    </Stamp>
    {(m.headline ?? "").split(" ").map((w, i) => (
      <Headline
        key={w}
        at={ENTER + i * 4}
        size={196}
        style={{ position: "absolute", left: PAGE.colLeft, top: 700 + i * 192 }}
      >
        {w}
      </Headline>
    ))}
    <Printed at={ART + 8} style={{ left: PAGE.colLeft, top: 1140 }}>
      <Rule width={520} thickness={6} color={paper.ink} />
    </Printed>
    <Printed at={ART + 10} style={{ left: PAGE.colLeft, top: 1200 }}>
      <Slug tone="ink2">Entered this session</Slug>
    </Printed>
  </>
);

// ---------------------------------------------------------------------------
// m10 — the charge falls away and the mug is whole again. The callback closes
// the film's one visual argument without a word of new copy to read.
// ---------------------------------------------------------------------------
const Dismissed: React.FC<{ m: Moment }> = ({ m }) => (
  <>
    {(m.headline ?? "").split(" ").map((w, i) => (
      <Headline
        key={w}
        at={ENTER + i * 4}
        size={150}
        style={{ position: "absolute", left: PAGE.colLeft, top: 430 + i * 150 }}
      >
        {w}
      </Headline>
    ))}
    <Plate at={ART} top={840} height={460}>
      <Surface x={100} y={400} w={654} />
      <MugAt x={427} y={400} size={320} />
    </Plate>
  </>
);

// ---------------------------------------------------------------------------
// m11 — THE LOCKUP. A bare page: no footer, no ruling, no docket. The mark, the
// name, one rule.
// ---------------------------------------------------------------------------
const Lockup: React.FC<{ m: Moment }> = ({ m }) => (
  <Printed at={ENTER} style={{ left: 0, top: 640, width: 1080 }}>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 44,
      }}
    >
      <CatHead size={200} color={paper.ink} strokeWidth={6} />
      <div style={{ width: 240, height: 3, backgroundColor: paper.rule }} />
      <Headline size={112} weight={700} style={{ letterSpacing: "-0.01em" }}>
        {m.headline}
      </Headline>
      <Slug>The State v. The Cat</Slug>
    </div>
  </Printed>
);

// ---------------------------------------------------------------------------
// The film.
// ---------------------------------------------------------------------------
const SCENES: Record<string, React.FC<{ m: Moment }>> = {
  m01: Hook,
  m02: CaseHeader,
  m03: Charge,
  m04: ExhibitPaw,
  m05: ExhibitSequence,
  m06: ExhibitPrediction,
  m07: NumberCard,
  m08: BlurCard,
  m09: Verdict,
  m10: Dismissed,
  m11: Lockup,
};

/** Per-moment document furniture. Identical across neighbours on purpose. */
const FRAME_PROPS: Record<string, React.ComponentProps<typeof DocumentFrame>> = {
  m01: { ruled: false, footerRight: "Opening" },
  m02: { ruled: false, spine: "Case file" },
  m03: { spine: "Count one", footerRight: "Count one" },
  m04: { spine: "Evidence", footerRight: "Exhibit A" },
  m05: { spine: "Evidence", footerRight: "Exhibit B" },
  m06: { spine: "Evidence", footerRight: "Exhibit C" },
  m07: { ruled: false, spine: "Findings", footerRight: "Finding 01" },
  m08: { ruled: false, spine: "Findings", footerRight: "Finding 02" },
  m09: { ruled: false, footerRight: "Verdict" },
  m10: { ruled: false, footerRight: "Closed" },
  m11: { ruled: false, footer: false, mark: false, docket: "", title: "" },
};

export const TheCatCourt03: React.FC = () => (
  <PaperBackground>
    {/* Score. Mastered separately; the picture does not depend on it. */}
    <Audio src={staticFile("audio/thecatcourt-03.mp3")} />

    {MOMENTS.map((m) => {
      const Scene = SCENES[m.id];
      const frames = atSeconds(m.dur);
      return (
        <Sequence key={m.id} from={atSeconds(m.at)} durationInFrames={frames}>
          <PageExit frames={frames}>
            <DocumentFrame {...FRAME_PROPS[m.id]}>
              <Scene m={m} />
            </DocumentFrame>
          </PageExit>
        </Sequence>
      );
    })}
  </PaperBackground>
);

// Guard: the composition's length is the moments file's length, not a number typed twice.
if (FILM03_FRAMES !== FPS * 60) {
  throw new Error("Film 03 is not 60s — moments.ts and the composition disagree.");
}
