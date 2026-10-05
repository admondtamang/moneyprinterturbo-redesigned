#!/usr/bin/env python3
"""Upbeat loopable bed for short-form video: kick/snare/hat + bass + a repeating hook.

Seamless: renders a whole number of bars and folds the ring-out onto the head, so it can be
looped to any clip length without a seam.
"""
import argparse, wave, numpy as np
from scipy.signal import butter, sosfilt

FS = 44100

def env(n, a, d, s=0.0, r=None):
    """attack/decay envelope in samples"""
    e = np.zeros(n)
    a = max(1, int(a)); d = max(1, int(d))
    e[:a] = np.linspace(0, 1, a)
    k = min(n, a + d)
    e[a:k] = np.linspace(1, s, k - a)
    if k < n: e[k:] = s
    return e

def kick(n, f0=150, f1=72, rng=None):
    t = np.arange(n) / FS
    f = f1 + (f0 - f1) * np.exp(-t * 34)
    ph = 2 * np.pi * np.cumsum(f) / FS
    body = np.sin(ph) * np.exp(-t * 17)
    click = (rng.standard_normal(n) if rng is not None else np.zeros(n)) * np.exp(-t * 420) * .22
    return np.tanh((body + click) * 1.5)

def snare(n, rng):
    t = np.arange(n) / FS
    noise = rng.standard_normal(n) * np.exp(-t * 26)
    sos = butter(4, [1400 / (FS/2), 7200 / (FS/2)], btype="band", output="sos")
    tone = np.sin(2*np.pi*192*t) * np.exp(-t*34) * .35
    return np.tanh((sosfilt(sos, noise) + tone) * 1.3)

def hat(n, rng, open_=False):
    t = np.arange(n) / FS
    noise = rng.standard_normal(n) * np.exp(-t * (14 if open_ else 95))
    sos = butter(4, 6000 / (FS/2), btype="high", output="sos")
    return sosfilt(sos, noise) * (.26 if open_ else .20)

def pluck(n, f0, rng, bright=.6):
    """short karplus-ish pluck for the hook"""
    N = max(2, int(FS / f0))
    buf = rng.standard_normal(N)
    for _ in range(int(6 * (1 - bright)) + 1):
        buf = np.convolve(buf, [.5, .5], mode="same")
    buf /= np.max(np.abs(buf)) + 1e-9
    out = np.empty(n); b = buf.copy(); i = 0
    for k in range(n):
        out[k] = b[i]; j = (i + 1) % N
        b[i] = .991 * .5 * (b[i] + b[j]); i = j
    t = np.arange(n) / FS
    return out * np.exp(-t * 2.6)

def bass(n, f0):
    t = np.arange(n) / FS
    sq = np.sign(np.sin(2*np.pi*f0*t)) * .5 + np.sin(2*np.pi*f0*t) * .5
    sos = butter(4, 900 / (FS/2), btype="low", output="sos")
    return sosfilt(sos, sq) * env(n, .004*FS, .16*FS, .10)

def build(bpm=104, bars=8, seed=5, key=261.63):
    rng = np.random.default_rng(seed)
    spb = 60.0 / bpm                    # seconds per beat
    beats = bars * 4
    n = int(beats * spb * FS)
    ring = int(1.2 * FS)
    L = np.zeros(n + ring); R = np.zeros(n + ring)

    def put(buf, pos, sig, gain=1.0, pan=.5):
        s = int(pos); e = min(s + len(sig), len(buf[0]))
        if e <= s: return
        buf[0][s:e] += sig[:e-s] * gain * np.cos(pan*np.pi/2)
        buf[1][s:e] += sig[:e-s] * gain * np.sin(pan*np.pi/2)
    B = (L, R)

    # --- drums: four-on-floor-ish with a syncopated push
    for b in range(beats):
        p = b * spb * FS
        if b % 4 in (0, 2):
            put(B, p, kick(int(.20*FS), rng=rng), .34, .5)
        if b % 4 == 2:                                   # extra push before the backbeat
            put(B, p + spb*FS*0.75, kick(int(.16*FS), rng=rng), .20, .5)
        if b % 4 in (1, 3):
            put(B, p, snare(int(.26*FS), rng), .62, .5)
        for eighth in (0, .5):
            op = (b % 4 == 3 and eighth == .5)
            put(B, p + eighth*spb*FS, hat(int((.18 if op else .07)*FS), rng, op),
                .13, .42 if eighth == 0 else .58)

    # --- bass + hook: I - vi - IV - V (C Am F G), 2 beats each
    prog = [1.0, 0.8909, 1.3348, 1.4983]                 # ratios: C, A(below), F, G
    hook = [0, 7, 12, 7, 9, 7, 4, 0]                     # semitones, C major pentatonic-ish
    for bar in range(bars):
        root = key * prog[bar % 4]
        for b in range(4):
            p = (bar*4 + b) * spb * FS
            if b in (0, 2):
                put(B, p, bass(int(spb*0.95*FS), root), .34, .5)
        # hook plays on the odd bars so it reads as a phrase, not wallpaper
        if True:
            notes = hook if bar % 2 == 1 else hook[:4] + hook[2:4] + hook[:2]
            for k, semi in enumerate(notes):
                p = (bar*4)*spb*FS + k*(spb/2)*FS
                f = key * 2 ** (semi/12)
                put(B, p, pluck(int(spb*1.15*FS), f*2, rng, bright=.8), 2.6, .5 + (k%3-1)*.10)
                put(B, p, pluck(int(spb*.75*FS), f*4, rng, bright=.9), 0.9, .5 - (k%3-1)*.10)

    # fold the ring-out onto the head -> seamless loop
    out = np.vstack([L[:n], R[:n]])
    tail = np.vstack([L[n:], R[n:]])
    out[:, :tail.shape[1]] += tail
    # tame the top: the snare's noise burst otherwise dominates and the bed reads as hiss
    sos_lo = butter(2, 55 / (FS/2), btype="high", output="sos")
    for ch in (0, 1):
        out[ch] = sosfilt(sos_lo, out[ch])                # trim inaudible sub
    out = np.tanh(out * 1.08)
    out /= np.max(np.abs(out)) / 0.89 + 1e-9
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--bpm", type=float, default=104)
    ap.add_argument("--bars", type=int, default=8)
    ap.add_argument("--seed", type=int, default=5)
    a = ap.parse_args()
    o = build(a.bpm, a.bars, a.seed)
    w = wave.open(a.out, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(FS)
    w.writeframes((np.clip(o.T, -1, 1) * 32767).astype("<i2").tobytes()); w.close()
    print(f"{a.out}  {o.shape[1]/FS:.2f}s  {a.bpm}bpm {a.bars} bars (seamless loop)")
