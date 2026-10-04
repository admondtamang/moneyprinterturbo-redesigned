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
          keep_audio=True):
    """captions: [[text, start, end], ...] seconds, relative to the trimmed clip."""
    vf = [f"crop='min(iw,ih*{W}/{H})':'min(ih,iw*{H}/{W})'", f"scale={W}:{H}", "fps=30"]
    for text, s, e in captions:
        vf.append(
            f"drawtext=fontfile={FONT}:text='{esc(text)}'"
            f":fontsize={fontsize}:fontcolor=white@0.97"
            f":shadowcolor=black@0.55:shadowx=2:shadowy=2"
            f":x=(w-text_w)/2:y=h*{y_frac}"
            f":enable='between(t,{s},{e})'")
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    if trim:
        cmd += ["-ss", str(trim[0]), "-t", str(trim[1] - trim[0])]
    cmd += ["-i", clip]
    if music:
        cmd += ["-i", music]
    cmd += ["-vf", ",".join(vf)]
    if music:
        cmd += ["-map", "0:v", "-map", "1:a", "-shortest", "-c:a", "aac", "-b:a", "128k"]
    elif keep_audio and has_audio(clip):
        # Natural sound beats a wrong-mood bed — the reference keeps its own audio.
        cmd += ["-map", "0:v", "-map", "0:a", "-c:a", "aac", "-b:a", "128k"]
    else:
        cmd += ["-an"]
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
    a = ap.parse_args()
    t = [float(x) for x in a.trim.split(",")] if a.trim else None
    build(a.clip, json.loads(a.captions), a.out, trim=t, music=a.music,
          fontsize=a.fontsize, keep_audio=not a.no_audio)
    d = subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                        "-of","csv=p=0", a.out], capture_output=True, text=True).stdout.strip()
    print(f"{a.out}  {d}s")
