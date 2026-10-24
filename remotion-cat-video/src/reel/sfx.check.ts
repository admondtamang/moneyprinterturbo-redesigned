// Guards the picture/sound contract. Run: npx tsx src/reel/sfx.check.ts
import { SFX_BY_BEAT, beatsWith, sfxAt, VERDICT_STAMP_BEAT } from "./sfx";
import { TOTAL_BEATS } from "./beats";

let n = 0;
const ok = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`FAIL: ${msg}`);
  n++;
};
const eq = (a: unknown, b: unknown, msg: string) =>
  ok(JSON.stringify(a) === JSON.stringify(b), `${msg} (got ${JSON.stringify(a)})`);

// One entry per beat of the film, no gaps.
eq(SFX_BY_BEAT.length, TOTAL_BEATS, "SFX_BY_BEAT covers every beat");

// The counts the story agent verified against the shotlist table.
eq(beatsWith("slam").length, 9, "9 slams");
eq(beatsWith("tick").length, 9, "9 ticks");
eq(beatsWith("click").length, 7, "7 clicks");
eq(beatsWith("whoosh").length, 7, "7 whooshes");
eq(beatsWith("thump").length, 4, "4 thumps");
eq(beatsWith("stamp").length, 3, "3 stamps");
eq(beatsWith("drop").length, 2, "2 drops");
eq(beatsWith("riser").length, 2, "2 risers");
eq(beatsWith("none").length, 1, "1 silent beat");

// Exact placements the score script must mirror.
eq(beatsWith("stamp"), [11, 28, 35], "stamps on 11/28/35");
eq(beatsWith("drop"), [22, 24], "drops on 22/24");
eq(beatsWith("riser"), [14, 31], "risers on 14/31");
eq(beatsWith("thump"), [0, 9, 18, 39], "thumps on 0/9/18/39");

// Anchors that the picture keys off.
eq(sfxAt(0), "thump", "film opens on the paw strike");
eq(sfxAt(3), "slam", "FALL lands with the mug");
eq(sfxAt(VERDICT_STAMP_BEAT), "stamp", "verdict stamp is a stamp");
eq(sfxAt(43), "none", "last beat is silent into the loop");

console.log(`sfx.check: ${n} assertions passed`);
