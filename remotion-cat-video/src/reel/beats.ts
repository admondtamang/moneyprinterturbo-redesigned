// The beat grid from docs/motion-rules.md § "Beat grid": 120 BPM @ 60fps, 11 bars = 22.0s.
// Scene code imports beat()/bar() from here. Never hand-tune a frame number.

export const FPS = 60;
export const BPM = 120;
export const FRAMES_PER_BEAT = 30; // 60fps * 60s / 120bpm
export const BEATS_PER_BAR = 4;
export const FRAMES_PER_BAR = FRAMES_PER_BEAT * BEATS_PER_BAR; // 120
export const TOTAL_BEATS = 44;
export const TOTAL_FRAMES = TOTAL_BEATS * FRAMES_PER_BEAT; // 1320

/** Frame on which beat `n` lands. Beat 0 is frame 0. Fractional n is allowed (e.g. 1.5 = offbeat). */
export const beat = (n: number) => n * FRAMES_PER_BEAT;

/** Frame of the downbeat of bar `n`. Bar 0 is frame 0. */
export const bar = (n: number) => n * FRAMES_PER_BAR;

export const beatsToFrames = (n: number) => n * FRAMES_PER_BEAT;
export const framesToBeats = (f: number) => f / FRAMES_PER_BEAT;

export const isDownbeat = (frame: number) => frame % FRAMES_PER_BAR === 0;
