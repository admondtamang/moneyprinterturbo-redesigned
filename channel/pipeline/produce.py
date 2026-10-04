#!/usr/bin/env python3
"""Produce + upload one Short for @thecatcourt, per channel/config.yaml and ideas.yaml.

Run standalone (systemd timer calls this). Exits non-zero on failure so the timer records it.
  --dry-run   render only, do not upload
  --no-render reuse the last render for this idea (debugging upload)
"""
import argparse, json, os, subprocess, sys, datetime, re
from pathlib import Path

ROOT = Path("/home/zmond/MoneyPrinterTurbo")
CH = ROOT / "channel"
LOGS = CH / "logs"
PY = ROOT / ".venv/bin/python"

def load_yaml(p):
    try:
        import yaml
    except ImportError:
        sys.exit("pyyaml missing: run  uv pip install pyyaml")
    return yaml.safe_load(p.read_text())

def log(entry):
    LOGS.mkdir(exist_ok=True)
    f = LOGS / "uploads.jsonl"
    with f.open("a") as fh:
        fh.write(json.dumps(entry) + "\n")

def pick_idea(ideas):
    for i in ideas:
        if not i.get("used"):
            return i
    return None

def mark_used(path, idea_id):
    """Flip `used: false` -> true for one id, preserving comments/formatting."""
    txt = path.read_text()
    blocks = txt.split("\n- id: ")
    for n, b in enumerate(blocks[1:], 1):
        if b.split("\n", 1)[0].strip() == idea_id:
            blocks[n] = b.replace("used: false", "used: true", 1)
            break
    path.write_text("\n- id: ".join(blocks))

def try_library(cfg, a):
    """Build a caption-driven 'bit' from a library clip. Returns None to fall through."""
    sys.path.insert(0, str(Path(__file__).parent))
    import footage as F
    from bit import build as bit_build

    m = F.load()
    cands = [c for c in m["clips"] if F.usable(c)]
    if not cands:
        waiting = [c for c in m["clips"] if F.cleared(c) and not F.usable(c)]
        if waiting:
            print(f"{len(waiting)} clip(s) in library awaiting captions "
                  f"({', '.join(c['id'] for c in waiting[:4])}) — falling back to stock flow",
                  file=sys.stderr)
        return None
    cands.sort(key=lambda c: (-(1 if (c.get("height") or 0) > (c.get("width") or 0) else 0),
                              -(c.get("duration") or 0), c["added"]))
    clip = cands[0]
    src = str(CH / clip["file"])
    dur = clip.get("duration") or 12.0

    caps = []
    n = len(clip["captions"])
    for k, row in enumerate(clip["captions"]):
        text, st, en = row[0], row[1], row[2]
        if st is None:                       # untimed -> spread evenly across the clip
            st = round(k * dur / n, 2)
            en = round((k + 1) * dur / n - 0.1, 2)
        caps.append([text, st, en])

    out = str(ROOT / "storage/tasks" / f"bit-{clip['id']}.mp4")
    bcfg = cfg.get("footage", {})
    print(f"[library:{clip['id']}] building bit, {len(caps)} captions, {dur}s", flush=True)
    bit_build(src, caps, out, music=bcfg.get("music_bed") or None,
              fontsize=bcfg.get("fontsize", 52))

    title = clip.get("title") or caps[0][0]
    prompt = clip.get("prompt") or "Does your cat do this?"
    credit = f"\n\nClip: {clip['credit']}" if clip.get("credit") else ""
    desc = f"{caps[0][0]}\n\n{prompt}{credit}\n\n#Shorts #cat #cats"

    entry = {"ts": datetime.datetime.now().isoformat(), "clip": clip["id"],
             "source": "library", "title": title, "video": out, "description": desc}
    if a.dry_run:
        entry["status"] = "dry_run"; log(entry); print(json.dumps(entry, indent=1)); return 0

    md = cfg["metadata"]
    res = do_upload(cfg, out, title, desc, md["default_tags"][: md["max_tags"]])
    ok = bool(res.get("success"))
    entry["status"] = "uploaded" if ok else "upload_failed"
    entry["response"] = {k: res.get(k) for k in
                         ("request_id", "job_id", "message", "error", "video_id", "url")
                         if res.get(k) is not None}
    log(entry)
    if ok:
        url = res.get("url") or res.get("request_id")
        for c in m["clips"]:
            if c["id"] == clip["id"]:
                c["used"] = True; c["used_in"] = url
                c["used_at"] = datetime.datetime.now().isoformat(timespec="seconds")
        F.save(m)
        print(f"[library:{clip['id']}] uploaded, clip marked used")
        return 0
    print(f"[library:{clip['id']}] UPLOAD FAILED: {res}", file=sys.stderr)
    return 1

def do_upload(cfg, video, title, desc, tags):
    backend = cfg["upload"].get("backend", "upload_post")
    if backend == "youtube_api":
        sys.path.insert(0, str(Path(__file__).parent))
        from youtube_upload import upload as yt_upload
        try:
            return yt_upload(video, title, desc, tags,
                             privacy=cfg["upload"]["privacy"],
                             synthetic=cfg["upload"]["contains_synthetic_media"])
        except Exception as e:
            return {"success": False, "error": f"{type(e).__name__}: {e}"}
    sys.path.insert(0, str(ROOT))
    from app.services.upload_post import UploadPostService
    return UploadPostService().upload_video(
        video_path=video, title=title, platforms=["youtube"],
        youtube_extra={"youtube_title": title[:100], "youtube_description": desc,
                       "tags": tags, "privacyStatus": cfg["upload"]["privacy"],
                       "contains_synthetic_media": cfg["upload"]["contains_synthetic_media"]})

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--idea", help="force a specific idea id")
    a = ap.parse_args()

    cfg = load_yaml(CH / "config.yaml")
    if cfg["schedule"].get("pause"):
        print("paused via config.yaml (schedule.pause: true)"); return 0

    # Prefer the footage library (your own / permission-cleared clips with a bit written).
    # Falls back to the stock-footage narrated flow when nothing is ready.
    if cfg.get("footage", {}).get("prefer_library", True) and not a.idea:
        rc = try_library(cfg, a)
        if rc is not None:
            return rc

    ideas = load_yaml(CH / "ideas.yaml")
    idea = next((i for i in ideas if i["id"] == a.idea), None) if a.idea else pick_idea(ideas)
    if not idea:
        print("NO UNUSED IDEAS — add entries to channel/ideas.yaml", file=sys.stderr)
        log({"ts": datetime.datetime.now().isoformat(), "status": "no_ideas"})
        return 2

    script = " ".join(idea["script"])
    terms = idea["terms"]
    if len(terms) != len(idea["script"]):
        print(f"idea {idea['id']}: {len(idea['script'])} sentences but {len(terms)} terms "
              "— must match 1:1 (see CLAUDE.md on --match-materials-to-script)", file=sys.stderr)
        return 2

    v, s = cfg["video"], cfg["subtitles"]
    cmd = [str(PY), "cli.py",
           "--video-script", script,
           "--video-terms", ",".join(terms),
           "--video-clip-duration", str(v["clip_duration"]),
           "--match-materials-to-script",
           "--video-aspect", v["aspect"],
           "--voice-name", cfg["voice"]["name"],
           "--subtitle-position", s["position"],
           "--font-name", s["font"],
           "--font-size", str(s["size"]),
           "--stroke-width", str(s["stroke_width"]),
           "--text-fore-color", s["fore_color"],
           "--stroke-color", s["stroke_color"]]
    if s.get("uppercase"):
        cmd.append("--subtitle-uppercase")

    print(f"[{idea['id']}] rendering...", flush=True)
    r = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-3000:], r.stderr[-3000:], file=sys.stderr)
        log({"ts": datetime.datetime.now().isoformat(), "idea": idea["id"],
             "status": "render_failed", "stderr": r.stderr[-1000:]})
        return 1

    m = re.search(r'"videos":\s*\[\s*"([^"]+)"', r.stdout)
    if not m:
        print("could not find output path in cli.py result", file=sys.stderr)
        log({"ts": datetime.datetime.now().isoformat(), "idea": idea["id"],
             "status": "no_output_path"})
        return 1
    video = m.group(1)
    dur = None
    try:
        dur = float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration",
                                    "-of","csv=p=0", video], capture_output=True,
                                   text=True).stdout.strip())
    except Exception:
        pass
    print(f"[{idea['id']}] rendered {video} ({dur}s)")

    if dur and not (v["target_seconds_min"] - 3 <= dur <= v["target_seconds_max"] + 5):
        print(f"WARNING: {dur}s is outside target {v['target_seconds_min']}-{v['target_seconds_max']}s. "
              "Winners were 18-34s; long videos underperform on this channel.", file=sys.stderr)

    desc = f"{idea['script'][0]}\n\n{idea['prompt']}\n\n#Shorts #cat #cats"
    md = cfg["metadata"]
    if len(desc) > md["max_description_chars"]:
        desc = desc[:md["max_description_chars"]]

    entry = {"ts": datetime.datetime.now().isoformat(), "idea": idea["id"],
             "title": idea["title"], "video": video, "duration": dur, "description": desc}

    if a.dry_run:
        entry["status"] = "dry_run"; log(entry)
        print(json.dumps(entry, indent=1)); return 0

    tags = md["default_tags"][: md["max_tags"]]
    backend = cfg["upload"].get("backend", "upload_post")
    if backend == "youtube_api":
        sys.path.insert(0, str(Path(__file__).parent))
        from youtube_upload import upload as yt_upload
        try:
            res = yt_upload(video, idea["title"], desc, tags,
                            privacy=cfg["upload"]["privacy"],
                            synthetic=cfg["upload"]["contains_synthetic_media"])
        except Exception as e:
            res = {"success": False, "error": f"{type(e).__name__}: {e}"}
    else:
        sys.path.insert(0, str(ROOT))
        from app.services.upload_post import UploadPostService
        res = UploadPostService().upload_video(
            video_path=video, title=idea["title"], platforms=["youtube"],
            youtube_extra={"youtube_title": idea["title"][:100],
                           "youtube_description": desc, "tags": tags,
                           "privacyStatus": cfg["upload"]["privacy"],
                           "contains_synthetic_media": cfg["upload"]["contains_synthetic_media"]})
    ok = bool(res.get("success"))
    entry["status"] = "uploaded" if ok else "upload_failed"
    entry["backend"] = backend
    entry["response"] = {k: res.get(k) for k in
                         ("request_id", "job_id", "message", "error", "video_id", "url")
                         if res.get(k) is not None}
    log(entry)
    if ok:
        mark_used(CH / "ideas.yaml", idea["id"])
        print(f"[{idea['id']}] uploaded. request_id={res.get('request_id')}")
        return 0
    print(f"[{idea['id']}] UPLOAD FAILED: {res}", file=sys.stderr)
    return 1

if __name__ == "__main__":
    sys.exit(main())
