// npx tsx src/reel/motion.check.ts
import { spring } from "remotion";
import { bar, beat, FRAMES_PER_BAR, framesToBeats, isDownbeat, TOTAL_FRAMES } from "./beats";
import { blurSwap, HOUSE, maskReveal, morphBox, slam, sumSprings } from "./motion";

const fps = 60;
let n = 0;
const ok = (label: string, cond: boolean) => {
  n++;
  if (!cond) throw new Error(`FAIL: ${label}`);
};
const near = (label: string, a: number, b: number, eps = 1e-9) =>
  ok(`${label} (${a} vs ${b})`, Math.abs(a - b) <= eps);

// --- beat grid arithmetic ---
ok("beat(4) === bar(1)", beat(4) === bar(1));
ok("bar(11) === TOTAL_FRAMES", bar(11) === TOTAL_FRAMES);
near("framesToBeats(bar(3)) === 12", framesToBeats(bar(3)), 12);
ok("isDownbeat(bar(7))", isDownbeat(bar(7)));
ok("!isDownbeat(beat(7))", !isDownbeat(beat(7)));
ok("beat(1.5) is the offbeat", beat(1.5) === 45);
ok("FRAMES_PER_BAR === 120", FRAMES_PER_BAR === 120);

// --- sumSprings ---
for (const f of [0, 7, 30, 61, 200]) {
  const at = 30;
  near(
    `sumSprings one change === plain spring @${f}`,
    sumSprings(f, fps, 0, [{ at, delta: 1 }]),
    spring({ frame: Math.max(0, f - at), fps, config: HOUSE }),
  );
}
near(
  "sumSprings settles at base + sum(deltas)",
  sumSprings(2000, fps, 100, [
    { at: 0, delta: 50 },
    { at: 120, delta: -30 },
    { at: 300, delta: 5 },
  ]),
  125,
  1e-6,
);
near("sumSprings === base before any change", sumSprings(0, fps, 42, [{ at: 60, delta: 9 }]), 42);
near("sumSprings with no changes === base", sumSprings(99, fps, 7, []), 7);

// --- maskReveal bounds ---
ok("maskReveal hidden before at", maskReveal(0, fps, 30, 20).progress === 0);
ok("maskReveal hidden at `at`", maskReveal(30, fps, 30, 20).progress === 0);
ok("maskReveal full at at+duration", maskReveal(50, fps, 30, 20).progress === 1);
ok("maskReveal full after at+duration", maskReveal(999, fps, 30, 20).progress === 1);
ok("maskReveal clipPath hides fully", maskReveal(0, fps, 30, 20).clipPath === "inset(0% 100% 0% 0%)");
ok("maskReveal clipPath reveals fully", maskReveal(50, fps, 30, 20).clipPath === "inset(0% 0% 0% 0%)");
const mid = maskReveal(40, fps, 30, 20).progress;
ok("maskReveal monotonic mid-way", mid > 0 && mid < 1);

// --- slam: settles, and overshoot stays tiny ---
near("slam settled scale === 1", slam(600, fps, 0).scale, 1, 1e-6);
near("slam settled y === 0", slam(600, fps, 0).y, 0, 1e-6);
ok("slam starts offset", slam(0, fps, 0).y > 40);
let maxOvershoot = 0;
for (let f = 0; f < 200; f++) maxOvershoot = Math.max(maxOvershoot, slam(f, fps, 0).p - 1);
ok(`slam overshoot <= 4% (was ${(maxOvershoot * 100).toFixed(2)}%)`, maxOvershoot <= 0.04);

// --- morphBox / blurSwap ---
const from = { w: 100, h: 100, r: 8 };
const to = { w: 400, h: 200, r: 48 };
const m0 = morphBox(0, fps, 0, from, to);
near("morphBox starts at from.w", m0.width, 100, 1e-6);
const m1 = morphBox(600, fps, 0, from, to);
near("morphBox ends at to.w", m1.width, 400, 1e-6);
near("morphBox ends at to.r", m1.borderRadius, 48, 1e-6);
near("blurSwap peaks at `at`", blurSwap(60, fps, 60).blur, 16);
near("blurSwap clears outside window", blurSwap(80, fps, 60).blur, 0);
ok("blurSwap shows `from` before at", blurSwap(59, fps, 60).showingTo === false);
ok("blurSwap shows `to` at at", blurSwap(60, fps, 60).showingTo === true);

console.log(`motion.check: ${n} assertions passed`);
