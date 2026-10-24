#!/usr/bin/env python3
"""Render a caption-driven "bit" Short — the format of high-performing comedy Shorts.

Differs from the cli.py pipeline deliberately:
  - NO TTS narration. Captions carry the joke.
  - Few captions (4-5), held on beats, NOT word-by-word subtitles.
  - Small sentence-case text centered mid-frame, not giant uppercase at the bottom.
  - One continuous clip so the viewer reads a single real event, not 3 unrelated stock shots.

Spec source: analysis of n-Gxw0W8YQs (1.7M views) — see channel/PLAYBOOK.md §9.
"""
import argparse, json, subprocess, sys
from pathlib import Path

FONT = "/home/zmond/MoneyPrinterTurbo/resource/fonts/BeVietnamPro-Medium.ttf"
W, H = 1080, 1920

def esc(t):
    return t.replace("\\", "\\\\").replace(":", r"\:").replace("'", r"\\\'").replace(",", r"\,")

def has_audio(path):
    r = subprocess.run(["ffprobe","-v","error","-select_streams","a",
                        "-show_entries","stream=codec_name","-of","csv=p=0", str(path)],
                       capture_output=True, text=True)
    return bool(r.stdout.strip())

def build(clip, captions, out, trim=None, music=None, fontsize=52, y_frac=0.54,
          keep_audio=True, music_gain=-7, music_duck_src=6):
    """captions: [[text, start, end], ...] seconds, relative to the trimmed clip."""
    vf = [f"crop='min(iw,ih*{W}/{H})':'min(ih,iw*{H}/{W})'", f"scale={W}:{H}", "fps=30"]
    for text, s, e in captions:
        vf.append(
            f"drawtext=fontfile={FONT}:text='{esc(text)}'"
            f":fontsize={fontsize}:fontcolor=white@0.97"
            f":shadowcolor=black@0.8:shadowx=2:shadowy=2:borderw=1:bordercolor=black@0.45"
            f":x=(w-text_w)/2:y=h*{y_frac}"
            f":enable='between(t,{s},{e})'")
    # ONE filter graph for video and audio. Mixing -vf with -filter_complex silently
    # dropped the audio chain (the limiter never ran and output clipped at 0.0 dBFS).
    vchain = "[0:v]" + ",".join(vf) + "[vout]"
    # AAC reconstructs percussive transients ~3 dB above the PCM peak, so the limiter
    # leaves real headroom (-7 dBFS) rather than the usual -1. YouTube normalises
    # loudness anyway, so a quieter, clean master beats a loud, clipped one.
    NORM = "loudnorm=I=-16:TP=-3:LRA=11,alimiter=limit=0.45:level=0"

    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    if trim:
        cmd += ["-ss", str(trim[0]), "-t", str(trim[1] - trim[0])]
    cmd += ["-i", clip]
    if music:
        cmd += ["-stream_loop", "-1", "-i", music]

    src_audio = keep_audio and has_audio(clip)
    if music and src_audio:
        graph = (f"{vchain};"
                 f"[0:a]volume={music_duck_src}dB[a0];"
                 f"[1:a]volume={music_gain}dB,afade=t=in:st=0:d=0.4[a1];"
                 f"[a0][a1]amix=inputs=2:duration=first:dropout_transition=0,{NORM}[aout]")
        amap = ["-map", "[vout]", "-map", "[aout]", "-shortest",
                "-c:a", "aac", "-b:a", "160k"]
    elif music:
        graph = (f"{vchain};"
                 f"[1:a]volume={music_gain}dB,afade=t=in:st=0:d=0.4,{NORM}[aout]")
        amap = ["-map", "[vout]", "-map", "[aout]", "-shortest",
                "-c:a", "aac", "-b:a", "160k"]
    elif src_audio:
        graph = f"{vchain};[0:a]{NORM}[aout]"
        amap = ["-map", "[vout]", "-map", "[aout]", "-c:a", "aac", "-b:a", "160k"]
    else:
        graph = vchain
        amap = ["-map", "[vout]", "-an"]

    cmd += ["-filter_complex", graph] + amap
    cmd += ["-c:v", "libx264", "-crf", "20", "-preset", "medium",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2500:], file=sys.stderr)
        sys.exit(1)
    return out

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--clip", required=True)
    ap.add_argument("--captions", required=True, help="JSON [[text,start,end],...]")
    ap.add_argument("--out", required=True)
    ap.add_argument("--trim", help="start,end seconds")
    ap.add_argument("--music")
    ap.add_argument("--fontsize", type=int, default=52)
    ap.add_argument("--no-audio", action="store_true")
    ap.add_argument("--music-gain", type=float, default=-7)
    a = ap.parse_args()
    t = [float(x) for x in a.trim.split(",")] if a.trim else None
    build(a.clip, json.loads(a.captions), a.out, trim=t, music=a.music,
          fontsize=a.fontsize, keep_audio=not a.no_audio, music_gain=a.music_gain)
    d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","csv=p=0", a.out], capture_output=True, text=True).stdout.strip()
    print(f"{a.out}  {d}s")


def build_montage(segments, captions, out, music=None, fontsize=52, y_frac=0.54,
                  music_gain=-5, cut=None):
    """Cut a rhythm INSIDE the footage — the format every 7M+ machinery Short uses.

    Research (PLAYBOOK dozer section): videos above 7M views cut 5-7 times per 10s on one
    continuous task; single-shot videos cap around 500k. `segments` is a list of
    [clip_path, start, duration] taken from one or several source clips.

    Captions are timed against the ASSEMBLED timeline, not any single source clip.
    """
    ins, chains, labels = [], [], []
    for i, seg in enumerate(segments):
        clip, st, dur = seg[0], seg[1], seg[2]
        # optional 4th/5th: zoom (1.0 = wide) and vertical focus (0=top,1=bottom).
        # Stock gives one camera per job, so punch-ins are how we get angle variety
        # without breaking the single-task continuity that makes the format work.
        zoom = float(seg[3]) if len(seg) > 3 else 1.0
        foc  = float(seg[4]) if len(seg) > 4 else 0.5
        ins += ["-ss", str(st), "-t", str(dur), "-i", clip]
        if zoom > 1.001:
            cw, chh = f"iw/{zoom:.4f}", f"ih/{zoom:.4f}"
            chains.append(
                f"[{i}:v]crop={cw}:{chh}:(iw-{cw})/2:(ih-{chh})*{foc:.3f},"
                f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                f"fps=30,setsar=1,setpts=PTS-STARTPTS[v{i}]")
        else:
            chains.append(
                f"[{i}:v]scale={W}:{H}:force_original_aspect_ratio=increase,"
                f"crop={W}:{H},fps=30,setsar=1,setpts=PTS-STARTPTS[v{i}]")
        labels.append(f"[v{i}]")
    graph = ";".join(chains) + ";" + "".join(labels) + f"concat=n={len(segments)}:v=1:a=0[cat]"

    cap = "[cat]"
    if captions:
        parts = []
        for text, s, e in captions:
            parts.append(
                f"drawtext=fontfile={FONT}:text='{esc(text)}'"
                f":fontsize={fontsize}:fontcolor=white@0.97"
                f":shadowcolor=black@0.8:shadowx=2:shadowy=2:borderw=1:bordercolor=black@0.45"
                f":x=(w-text_w)/2:y=h*{y_frac}"
                f":enable='between(t,{s},{e})'")
        graph += f";[cat]{','.join(parts)}[vout]"
        cap = "[vout]"
    else:
        graph += ";[cat]null[vout]"
        cap = "[vout]"

    NORM = "loudnorm=I=-16:TP=-3:LRA=11,alimiter=limit=0.45:level=0"
    cmd = ["ffmpeg", "-y", "-loglevel", "error"] + ins
    if music:
        cmd += ["-stream_loop", "-1", "-i", music]
        graph += (f";[{len(segments)}:a]volume={music_gain}dB,"
                  f"afade=t=in:st=0:d=0.4,{NORM}[aout]")
        amap = ["-map", cap, "-map", "[aout]", "-shortest", "-c:a", "aac", "-b:a", "160k"]
    else:
        amap = ["-map", cap, "-an"]
    cmd += ["-filter_complex", graph] + amap
    cmd += ["-c:v", "libx264", "-crf", "20", "-preset", "medium",
            "-pix_fmt", "yuv420p", "-movflags", "+faststart", out]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        print(r.stderr[-2500:], file=sys.stderr)
        sys.exit(1)
    return out
