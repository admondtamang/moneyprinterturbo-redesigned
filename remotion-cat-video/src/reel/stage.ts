// Shared stage geometry for Film 01.
//
// Why this exists: the film must loop — beat 43 has to resolve into beat 0 with element
// positions AND velocities matching (docs/motion-rules.md § "Loop check"). Hook and Lockup are
// built by different people, so the opening tableau is defined ONCE here and both target it.
// Neither act may hardcode these numbers.

export const W = 1080;
export const H = 1920;

/** Safe area. YouTube Shorts overlays the bottom ~14% and the right edge. Keep type inside. */
export const SAFE = { top: 180, bottom: 420, left: 72, right: 160 } as const;

/** The opening/closing tableau: a table edge, a mug at rest on it, a paw entering from the right. */
export const STAGE = {
  /** Table surface line, y in composition px. The mug sits ON this. */
  tableY: 1180,
  /** Table edge runs from x=0 to here, so the mug sits at the lip with nothing under it. */
  tableEdgeX: 560,
  /** Mug rest position (centre of its base). At the lip. */
  mugRest: { x: 470, y: 1180 },
  mugSize: 260,
  /** Where the mug has fallen to by the end of the hook — below the frame. */
  mugFallen: { x: 470, y: 1980 },
  /** Paw silhouette: enters frame-right, travels left, contacts the mug on beat 0. */
  pawSize: 420,
  pawOffstage: { x: 1240, y: 1040 },
  pawContact: { x: 700, y: 1040 },
} as const;

/**
 * Loop contract. At beat 43 the frame must read identically to beat 0:
 *   - mug at STAGE.mugRest, upright, whole (not fragments)
 *   - table edge drawn to STAGE.tableEdgeX
 *   - paw at STAGE.pawContact, 90 frames into its approach, moving LEFT at the same speed it
 *     has at beat 0. (NOT at pawOffstage — that x is fully off-screen, so the paw would be
 *     invisible rather than "entering". Hook starts its travel 90 frames early for this reason;
 *     Lockup derives the same offset from these constants. Never hardcode it.)
 * The paw's velocity matters as much as its position — if it is parked at beat 43 and springs
 * at beat 0, the loop reads as a cut. Both acts drive it with the same linear approach.
 */
export const LOOP_PAW_PX_PER_FRAME = 6;

/**
 * Stroke weight of the table rule. Shared because Hook and Lockup both draw it and it is part
 * of the loop contract: Hook had it at 8 and Lockup at 5, which left a 1px hairline mismatch at
 * the loop point that survived a visual check and only surfaced on a pixel diff. Same drift
 * class as TABLEAU — if both acts must draw a thing, neither act owns its number.
 */
export const TABLE_STROKE = 8;

/** Paw x at a given frame offset from its entry, travelling left. Used by Hook AND Lockup. */
export const pawX = (framesSinceEntry: number) =>
  STAGE.pawOffstage.x - LOOP_PAW_PX_PER_FRAME * framesSinceEntry;
