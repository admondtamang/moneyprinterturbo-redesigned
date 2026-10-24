// The readability gate, as runnable code. Run: npx tsx src/reel/moments.check.ts
//
// The complaint on the dark cut was "too fast, I can't read, some screens just go off".
// That is a measurable property, so it is asserted here rather than judged on a contact sheet.
// If someone shortens a moment below its reading budget, this fails before a render happens.
import { MOMENTS, TOTAL_FRAMES, DURATION_S } from "./moments";

/** Entrance+exit overhead that does NOT count as reading time. */
const SETTLE_S = 0.9;
/** Comfortable silent reading for on-screen display type. ~2.5 words/sec is generous-but-safe. */
const WORDS_PER_SEC = 2.5;
/** Nothing readable may be on screen for less than this, however short the text. */
const MIN_HOLD_S = 2.5;

const words = (s?: string) => (s ? s.trim().split(/\s+/).length : 0);

let n = 0;
const fail = (m: string) => {
  throw new Error(`FAIL: ${m}`);
};

console.log(`${"id".padEnd(5)}${"act".padEnd(10)}${"words".padEnd(7)}${"need".padEnd(7)}${"hold".padEnd(7)}ok`);

let prevEnd = 0;
for (const m of MOMENTS) {
  const w = words(m.label) + words(m.headline) + words(m.detail);
  const need = Math.max(MIN_HOLD_S, w / WORDS_PER_SEC);
  const hold = m.dur - SETTLE_S;

  if (hold < need) {
    fail(
      `${m.id} holds ${hold.toFixed(1)}s but needs ${need.toFixed(1)}s to read ${w} words ` +
        `(dur ${m.dur}s - ${SETTLE_S}s settle). Lengthen it or cut words.`,
    );
  }
  if (m.at < prevEnd) fail(`${m.id} starts at ${m.at}s, before ${prevEnd}s — moments overlap`);
  if (m.at > prevEnd) fail(`gap of ${(m.at - prevEnd).toFixed(1)}s before ${m.id} — dead air`);

  console.log(
    `${m.id.padEnd(5)}${m.act.padEnd(10)}${String(w).padEnd(7)}${need.toFixed(1).padEnd(7)}${hold.toFixed(1).padEnd(7)}ok`,
  );
  prevEnd = m.at + m.dur;
  n++;
}

if (prevEnd !== DURATION_S) fail(`moments end at ${prevEnd}s, film is ${DURATION_S}s`);
if (TOTAL_FRAMES !== DURATION_S * 60) fail("TOTAL_FRAMES disagrees with DURATION_S");

console.log(`\nmoments.check: ${n} moments, all meet their reading budget. Film ${DURATION_S}s.`);
