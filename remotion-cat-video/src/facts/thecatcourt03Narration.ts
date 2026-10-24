export const VOICEOVER_DIR = "thecatcourt-03";
export const NARRATION_VOICE = "Sulafat";

// Narration for Film 03 — the 60s readable cut (src/reel/moments.ts, 11 moments).
//
// CONTRACT
// - The type carries the headlines. These lines NEVER read on-screen copy back.
// - Each moment holds still so the viewer can read it. The voice enters after the
//   type has settled and is gone before the hold ends. The silence is the point.
// - Budgeted at the MEASURED Sulafat rate: 1.5 words/sec, including its pauses.
//   53 words -> ~35.3s of speech = 59% of 60s, inside the 55-65% band.
//
// RELIABILITY (docs/review-02-reliability.md)
// - No line asserts a cause for the push. The exhibit lines state what the exhibit
//   PROVES, per the auditor's proposed shape, and cap it with "Nothing more."
//   The rejected X-not-Y fragments ("Sensation, not intent." etc.) are gone.
// - The spine survives intact at m09/m10: no study explains why; intent unproven.
// - m07 is hedged to the four measured animals (Bloom & Berkley 1977, n=4).
export const narrationLines: { id: string; text: string }[] = [
  // m01 — hook, window 0-6s — 4 words (~2.7s)
  { id: "m01", text: "The mug had help." },

  // m02 — charge, window 6-11s — 6 words (~4.0s)
  { id: "m02", text: "The prosecution alleges a deliberate act." },

  // m03 — charge, window 11-16s — 6 words (~4.0s)
  { id: "m03", text: "The defence answers with three exhibits." },

  // m04 — evidence A, window 16-24s — 5 words (~3.3s)
  { id: "m04", text: "This proves sensation. Nothing more." },

  // m05 — evidence B, window 24-32s — 5 words (~3.3s)
  { id: "m05", text: "This proves play. Nothing more." },

  // m06 — evidence C, window 32-40s — 5 words (~3.3s)
  { id: "m06", text: "This proves expectation. Nothing more." },

  // m07 — number, window 40-44s — 5 words (~3.3s)
  { id: "m07", text: "These cats focused no nearer." },

  // m08 — number, window 44-48s — 5 words (~3.3s)
  { id: "m08", text: "A table-edge mug sits inside." },

  // m09 — verdict, window 48-52s — 4 words (~2.7s)
  { id: "m09", text: "No study explains why." },

  // m10 — verdict, window 52-56s — 4 words (~2.7s)
  { id: "m10", text: "Intent was never proven." },

  // m11 — lockup, window 56-60s — 4 words (~2.7s)
  { id: "m11", text: "The next defendant runs." },
];

// Start time of each clip in the 60s timeline, in seconds.
// Each start sits after its moment's entrance (~0.4-0.6s) plus reading head-start,
// and every line ends before its moment's window closes and before the next start.
export const NARRATION_START_SECONDS: Record<string, number> = {
  m01: 0.8,
  m02: 6.6,
  m03: 11.6,
  m04: 19.0,
  m05: 27.0,
  m06: 35.0,
  m07: 40.3,
  m08: 44.3,
  m09: 48.5,
  m10: 52.5,
  m11: 56.6,
};
