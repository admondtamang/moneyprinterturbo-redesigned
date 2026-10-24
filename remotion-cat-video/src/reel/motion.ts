// Motion idioms for src/reel/. Thin layer over Remotion's spring()/interpolate() —
// see docs/motion-rules.md § "Motion". Every export is a pure function of `frame`.
import { interpolate, spring, type SpringConfig } from "remotion";

/**
 * House spring: fast settle, ~2.5% overshoot (damping ratio 0.76).
 * Satisfies "at most a tiny overshoot" — nothing bouncy or elastic.
 */
export const HOUSE: Partial<SpringConfig> = {
  stiffness: 220,
  damping: 16,
  mass: 0.5,
};

/** Even tighter: critically damped, zero overshoot. For things that must not wobble. */
export const FIRM: Partial<SpringConfig> = {
  stiffness: 220,
  damping: 21,
  mass: 0.5,
};

/** A HOUSE spring whose t=0 is frame `at`. 0 before `at`, 1 once settled. */
export const springAt = (
  frame: number,
  fps: number,
  at: number,
  config: Partial<SpringConfig> = HOUSE,
) => spring({ frame: Math.max(0, frame - at), fps, config });

export type Change = { at: number; delta: number; config?: Partial<SpringConfig> };

/**
 * A value with several targets is the SUM of one spring per change, not a chain of
 * interpolations. Each change adds `delta * spring(frame - at)`; settles at base + Σdelta.
 */
export const sumSprings = (
  frame: number,
  fps: number,
  base: number,
  changes: Change[],
) =>
  changes.reduce(
    (acc, c) => acc + c.delta * springAt(frame, fps, c.at, c.config),
    base,
  );

/**
 * The house entrance: rises from below and overshoots its scale by a hair, then settles.
 * Spread onto a transform; `p` is exposed for anything that needs to key off the same curve.
 */
export const slam = (frame: number, fps: number, at: number) => {
  const p = springAt(frame, fps, at);
  return {
    p,
    scale: 1 + 0.14 * (1 - p),
    y: 44 * (1 - p),
    transform: `translateY(${44 * (1 - p)}px) scale(${1 + 0.14 * (1 - p)})`,
  };
};

/**
 * Linear wipe-in, left to right. Text arrives by mask or slam, never by opacity.
 * `progress` is exactly 0 at/before `at` and exactly 1 at/after `at + durationInFrames`.
 */
export const maskReveal = (
  frame: number,
  _fps: number,
  at: number,
  durationInFrames: number,
) => {
  const progress = interpolate(frame, [at, at + durationInFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {
    progress,
    clipPath: `inset(0% ${(1 - progress) * 100}% 0% 0%)`,
  };
};

export type BoxShape = { w: number; h: number; r: number };

/** One container changing size and corner radius. The container never cuts. */
export const morphBox = (
  frame: number,
  fps: number,
  at: number,
  from: BoxShape,
  to: BoxShape,
) => {
  const p = springAt(frame, fps, at, FIRM);
  const lerp = (a: number, b: number) => a + (b - a) * p;
  return {
    p,
    width: lerp(from.w, to.w),
    height: lerp(from.h, to.h),
    borderRadius: lerp(from.r, to.r),
  };
};

/**
 * Short blur spike centred on `at`, so content swapping inside a morphing container
 * reads as one object rather than a cut. Swap the content when `showingTo` flips.
 */
export const blurSwap = (
  frame: number,
  _fps: number,
  at: number,
  halfWidth = 5,
  peak = 16,
) => {
  const blur = interpolate(
    Math.abs(frame - at),
    [0, halfWidth],
    [peak, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return { blur, showingTo: frame >= at, filter: `blur(${blur}px)` };
};
