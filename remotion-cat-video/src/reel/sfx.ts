// Canonical beat -> SFX map for Film 01. THE single source of truth shared by picture and sound.
//
// Why this file exists: the score and the shotlist were authored in parallel and drifted — the
// score placed hits from the act structure while the shotlist placed them on visual events, so
// picture and sound did not land together. Both now derive from this table.
// scripts/generate-score.sh synthesises these beats; scene code keys its impacts off them.
// If a hit moves, it moves HERE first.

export type Sfx =
  | "thump"
  | "slam"
  | "whoosh"
  | "click"
  | "tick"
  | "stamp"
  | "drop"
  | "riser"
  | "none";

/** Index = beat number (0..43). Mirrors the SFX column of docs/shotlist.md §3. */
export const SFX_BY_BEAT: readonly Sfx[] = [
  "thump", "slam", "slam", "slam",        // 0-3   hook
  "whoosh", "click", "tick", "whoosh",    // 4-7   charge
  "tick", "thump", "click", "stamp",      // 8-11  charge
  "slam", "whoosh", "riser", "slam",      // 12-15 exhibit A
  "click", "tick", "thump", "slam",       // 16-19 exhibit B
  "click", "tick", "drop", "slam",        // 20-23 exhibit C
  "drop", "whoosh", "tick", "tick",       // 24-27 deliberation
  "stamp", "click", "whoosh", "riser",    // 28-31 deliberation
  "whoosh", "slam", "slam", "stamp",      // 32-35 verdict
  "tick", "click", "tick", "thump",       // 36-39 verdict
  "click", "tick", "whoosh", "none",      // 40-43 lockup
];

/** Beats carrying a given sound, e.g. beatsWith("stamp") -> [11, 28, 35]. */
export const beatsWith = (s: Sfx): number[] =>
  SFX_BY_BEAT.flatMap((v, i) => (v === s ? [i] : []));

/** The sound landing on beat n, or "none". */
export const sfxAt = (n: number): Sfx => SFX_BY_BEAT[n] ?? "none";

/** The loudest single hit in the film — the verdict stamp. Picture must recoil on this frame. */
export const VERDICT_STAMP_BEAT = 35;
