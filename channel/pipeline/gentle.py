#!/usr/bin/env python3
"""Playful-but-soothing bed: warm marimba melody + soft pad + light shaker. No drums.

Design: "playful" comes from movement — a syncopated pentatonic melody that skips along.
"Soothing" comes from timbre — wooden marimba tones with soft attacks, a warm pad underneath,
and a shaker instead of a kick/snare, so there are no hard transients to jolt the viewer.
Major pentatonic throughout, so no interval can land dissonant.

Seamless: whole number of bars, ring-out folded onto the head.
"""
import argparse, wave, numpy as np
from scipy.signal import butter, sosfilt

FS = 44100
PENT = [0, 2, 4, 7, 9]                     # major pentatonic

def marimba(n, f0, rng):
    """Wooden bar: strong fundamental, a quiet 4th partial, soft attack, quick warm decay."""
    t = np.arange(n) / FS
    v = np.sin(2*np.pi*f0*t) * np.exp(-t*4.0)
    v += .30 * np.sin(2*np.pi*f0*3.9*t + rng.uniform(0, 6.28)) * np.exp(-t*9.0)
    v += .10 * np.sin(2*np.pi*f0*9.2*t + rng.uniform(0, 6.28)) * np.exp(-t*16.0)
    a = int(.006*FS)                        # soft mallet, not a click
    v[:a] *= np.linspace(0, 1, a)
    return v / (np.max(np.abs(v)) + 1e-9)

def pad(n, root, rng):
    """Warm sustained bed — root, fifth, octave with slow detuned drift."""
    t = np.arange(n) / FS
    out = np.zeros(n)
    for mult, amp in ((1.0, .55), (1.5, .32), (2.0, .22)):
        for det in (-.1, .1):
            ph = rng.uniform(0, 6.28)
            s = np.sin(2*np.pi*(root*mult + det)*t + ph)
            lfo = .85 + .15*np.sin(2*np.pi*rng.uniform(.05, .11)*t + ph)
            out += s * amp * lfo
    sos = butter(2, 1800/(FS/2), btype="low", output="sos")
    return sosfilt(sos, out) / (np.max(np.abs(out)) + 1e-9)

def shaker(n, rng):
    t = np.arange(n) / FS
    s = rng.standard_normal(n) * np.exp(-t*52)
    sos = butter(4, [3200/(FS/2), 11000/(FS/2)], btype="band", output="sos")
    return sosfilt(sos, s)

def build(bpm=88, bars=8, seed=11, key=293.66):     # D major-ish, warm register
    rng = np.random.default_rng(seed)
    spb = 60.0/bpm
    beats = bars*4
    n = int(beats*spb*FS); ring = int(2.0*FS)
    L = np.zeros(n+ring); R = np.zeros(n+ring); B = (L, R)

    def put(pos, sig, gain, pan=.5):
        s = int(pos); e = min(s+len(sig), len(L))
        if e <= s: return
        B[0][s:e] += sig[:e-s]*gain*np.cos(pan*np.pi/2)
        B[1][s:e] += sig[:e-s]*gain*np.sin(pan*np.pi/2)

    prog = [1.0, 1.1892, 0.8909, 1.0]       # I - III - vi - I, gentle and resolving
    for bar in range(bars):
        root = key/2 * prog[bar % 4]
        put(bar*4*spb*FS, pad(int(spb*4.3*FS), root, rng), .085, .5)

        # melody: skipping eighth-note figure, rests built in so it breathes
        pattern = [0, .5, 1.5, 2, 3, 3.5] if bar % 2 == 0 else [0, 1, 1.5, 2.5, 3]
        idx = rng.integers(0, len(PENT))
        for k, off in enumerate(pattern):
            idx = int(np.clip(idx + rng.choice([-2,-1,1,1,2]), 0, len(PENT)*2-1))
            semi = PENT[idx % len(PENT)] + 12*(idx // len(PENT))
            f = key * 2**(semi/12)
            put((bar*4+off)*spb*FS, marimba(int(spb*1.5*FS), f, rng), 1.45,
                .5 + (k % 3 - 1)*.14)
            if k % 2 == 0:                  # soft octave sparkle
                put((bar*4+off)*spb*FS, marimba(int(spb*.7*FS), f*2, rng), .46, .5)

        for e8 in (0, 1, 2, 3):             # light shaker on the offbeats only
            put((bar*4+e8+.5)*spb*FS, shaker(int(.06*FS), rng), .13, .55)

    out = np.vstack([L[:n], R[:n]])
    tail = np.vstack([L[n:], R[n:]])
    out[:, :tail.shape[1]] += tail
    sos = butter(2, 60/(FS/2), btype="high", output="sos")
    for ch in (0, 1):
        out[ch] = sosfilt(sos, out[ch])
    out = np.tanh(out*1.02)
    out /= np.max(np.abs(out))/0.85 + 1e-9
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--bpm", type=float, default=88)
    ap.add_argument("--bars", type=int, default=8)
    ap.add_argument("--seed", type=int, default=11)
    a = ap.parse_args()
    o = build(a.bpm, a.bars, a.seed)
    w = wave.open(a.out, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(FS)
    w.writeframes((np.clip(o.T, -1, 1)*32767).astype("<i2").tobytes()); w.close()
    print(f"{a.out}  {o.shape[1]/FS:.2f}s  {a.bpm}bpm {a.bars} bars")
