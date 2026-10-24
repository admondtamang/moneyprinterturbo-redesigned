export const VOICEOVER_DIR = "thecatcourt-02";
export const NARRATION_VOICE = "Sulafat";

// Narration for the 35.2s narrated cut of Film 01 (The State v. The Cat).
// The on-screen type carries the headlines; these lines carry the connective
// tissue and never read a headline back. Every factual statement is a rephrase
// of a claim already sourced in docs/shotlist.md section 6.
//
// Pacing budget is the MEASURED rate for Sulafat: ~1.5 words/sec including its
// natural pauses. (The first cut assumed 2.6 w/s and overran by 11%.)
export const narrationLines: { id: string; text: string }[] = [
  // HOOK — window 0.0-3.2s — 4 words (~2.7s est; 1.93s measured)
  { id: "hook", text: "The mug had help." },

  // CHARGE — window 3.2-9.6s — 5 words (~3.3s)
  { id: "charge", text: "The prosecution alleges deliberate intent." },

  // EVIDENCE A — window 9.6-12.8s — 3 words (~2.0s)
  { id: "evidence-a", text: "Sensation, not intent." },

  // EVIDENCE B — window 12.8-16.0s — 3 words (~2.0s)
  { id: "evidence-b", text: "Play, not malice." },

  // EVIDENCE C — window 16.0-19.2s — 3 words (~2.0s)
  { id: "evidence-c", text: "Expectation, not design." },

  // DELIBERATION — window 19.2-25.6s — 6 words (~4.0s)
  { id: "deliberation", text: "The mug sits inside that distance." },

  // VERDICT — window 25.6-32.0s — 7 words (~4.7s)
  { id: "verdict", text: "No study explains why. Intent is unproven." },

  // LOCKUP — window 32.0-35.2s — 4 words (~2.7s)
  { id: "lockup", text: "The next defendant runs." },
];

// Intended start time of each clip in the 35.2s timeline, in seconds.
// Each start leaves the act's opening hit unobstructed; at 1.5 w/s every line
// finishes before its window closes and before the next line starts.
export const NARRATION_START_SECONDS: Record<string, number> = {
  hook: 0.4,
  charge: 3.4,
  "evidence-a": 9.8,
  "evidence-b": 13.0,
  "evidence-c": 16.2,
  deliberation: 19.8,
  verdict: 26.4,
  lockup: 32.2,
};
