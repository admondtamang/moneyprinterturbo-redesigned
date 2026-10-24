// Film 03 — the readable cut. 60 fps, 3600 frames, 60.0s.
//
// WHY THIS REPLACES THE BEAT GRID.
// Films 01/02 run on a 44-beat grid with "something new every beat" (docs/motion-rules.md).
// That is showreel logic and it is exactly what made the film unreadable: 44 events meant each
// line of type was on screen for well under a second. Slowing the same timeline did not fix it,
// because the problem was event DENSITY, not tempo.
//
// So this film is built from ~16 MOMENTS, not 44 beats. A moment is a thing you read, and it is
// defined by how long a human needs to read it — not by the music.
//
// READING BUDGET (the rule this file enforces):
//   - A headline of up to 5 words needs >= 2.5s on screen, fully settled.
//   - A detail line of up to 12 words needs >= 4.0s.
//   - Settle time (the entrance animation) does NOT count toward reading time. Type must be
//     fully readable for the stated hold, THEN exit.
//   - Nothing leaves the screen while it is still the newest thing the viewer has to read.
export const FPS = 60;
export const DURATION_S = 60;
export const TOTAL_FRAMES = FPS * DURATION_S; // 3600

/** Score tempo. 60 BPM = 1 beat per second, so moment edges land on beats without arithmetic. */
export const BPM = 60;
export const FRAMES_PER_BEAT = 60;

export type Moment = {
  id: string;
  /** Start in seconds. */
  at: number;
  /** Total length in seconds, entrance + hold + exit. */
  dur: number;
  /** Small label above the headline, e.g. "EXHIBIT A". Counts toward the reading budget. */
  label?: string;
  /** What the viewer reads. Used by moments.check.ts to compute required dwell. */
  headline?: string;
  detail?: string;
  act: "hook" | "charge" | "evidence" | "number" | "verdict" | "lockup";
};

/** The film. 11 moments over 60s. Edit timings HERE — never in a scene file.
 *  The standalone "EXHIBIT A/B/C" title cards from the earlier cut are gone: they burned 12s
 *  and said nothing. The label now rides above its own claim. */
export const MOMENTS: Moment[] = [
  { id: "m01", at: 0, dur: 6, act: "hook", headline: "IT DID NOT FALL" },

  { id: "m02", at: 6, dur: 5, act: "charge", headline: "THE STATE v. THE CAT", detail: "DOCKET No. 01-CAT" },
  { id: "m03", at: 11, dur: 5, act: "charge", headline: "WILFUL DISPLACEMENT", detail: "OF ONE CERAMIC MUG" },

  { id: "m04", at: 16, dur: 8, act: "evidence", label: "EXHIBIT A", headline: "THE PAW IS A SENSOR",
    detail: "Deep pad receptors sharpen as vibration speeds up." },
  { id: "m05", at: 24, dur: 8, act: "evidence", label: "EXHIBIT B", headline: "BATTING IS HUNTING",
    detail: "Object play repeats poke, bat, scoop, pounce, grasp." },
  { id: "m06", at: 32, dur: 8, act: "evidence", label: "EXHIBIT C", headline: "CATS PREDICT THE DROP",
    detail: "A rattle makes a cat expect something to fall." },

  { id: "m07", at: 40, dur: 4, act: "number", headline: "25-36 CM", detail: "NEAR POINT - 4 CATS" },
  { id: "m08", at: 44, dur: 4, act: "number", headline: "ANY CLOSER IS BLUR" },

  { id: "m09", at: 48, dur: 4, act: "verdict", headline: "NOT GUILTY" },
  { id: "m10", at: 52, dur: 4, act: "verdict", headline: "CHARGE DISMISSED" },

  { id: "m11", at: 56, dur: 4, act: "lockup", headline: "thecatcourt" },
];

export const momentById = (id: string) => MOMENTS.find((m) => m.id === id);
export const atSeconds = (s: number) => Math.round(s * FPS);
/** Frame window of a moment: [start, end). */
export const windowOf = (m: Moment) => [atSeconds(m.at), atSeconds(m.at + m.dur)] as const;
