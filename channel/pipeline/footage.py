#!/usr/bin/env python3
"""Footage library: ingest, track provenance/permission, hand clips to the pipeline.

Permission is enforced, not advisory — `pick` only ever returns clips cleared for use.
Rationale in channel/footage/README.md and PLAYBOOK.md §3.
"""
import argparse, hashlib, json, shutil, subprocess, sys, datetime
from pathlib import Path

CH = Path("/home/zmond/MoneyPrinterTurbo/channel")
FOOT = CH / "footage"
INBOX, USED, CLIPS = FOOT / "inbox", FOOT / "used", FOOT / "clips"
MANIFEST = FOOT / "manifest.json"
OK_PERMS = {"own", "granted", "licensed"}
VIDEO_EXT = {".mp4", ".mov", ".m4v", ".mkv", ".webm", ".avi", ".3gp"}

def load():
    return json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"clips": []}

def save(m):
    MANIFEST.write_text(json.dumps(m, indent=1))

def probe(p):
    try:
        out = subprocess.run(
            ["ffprobe", "-v", "error", "-show_entries",
             "stream=width,height,r_frame_rate,codec_type", "-show_entries",
             "format=duration", "-of", "json", str(p)],
            capture_output=True, text=True, timeout=120).stdout
        d = json.loads(out)
        v = next((s for s in d.get("streams", []) if s.get("codec_type") == "video"), {})
        has_audio = any(s.get("codec_type") == "audio" for s in d.get("streams", []))
        num, _, den = (v.get("r_frame_rate") or "0/1").partition("/")
        return {"duration": round(float(d["format"]["duration"]), 2),
                "width": v.get("width"), "height": v.get("height"),
                "fps": round(float(num) / float(den or 1), 2) if den else None,
                "has_audio": has_audio}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}

def read_sidecar(p):
    """Optional captions file next to the clip: <same-stem>.txt

    One caption per line. Either:
        How to tire out your cat?
    (evenly spaced across the clip), or with explicit timing:
        How to tire out your cat? | 0 | 2.0
    """
    side = p.with_suffix(".txt")
    if not side.exists():
        return None
    lines = [l.strip() for l in side.read_text().splitlines() if l.strip()]
    if not lines:
        return None
    out, timed = [], all("|" in l for l in lines)
    if timed:
        for l in lines:
            parts = [x.strip() for x in l.split("|")]
            out.append([parts[0], float(parts[1]), float(parts[2])])
    else:
        out = [[l, None, None] for l in lines]       # timed at render against duration
    return out

def cid(p):
    h = hashlib.sha1()
    with open(p, "rb") as f:
        h.update(f.read(1 << 20))         # first MB is enough to dedupe
    return h.hexdigest()[:12]

def ingest(args):
    m = load()
    known = {c["id"] for c in m["clips"]}
    added = 0
    for p in sorted(INBOX.iterdir()):
        if p.is_dir() or p.suffix.lower() not in VIDEO_EXT:
            continue
        i = cid(p)
        if i in known:
            print(f"  skip (already known): {p.name}")
            continue
        caps = read_sidecar(p)
        meta = probe(p)
        if "error" in meta:
            print(f"  SKIP unreadable {p.name}: {meta['error']}", file=sys.stderr)
            continue
        dest = CLIPS / f"{i}{p.suffix.lower()}"
        shutil.copy2(p, dest)
        m["clips"].append({
            "id": i, "file": str(dest.relative_to(CH)), "orig_name": p.name,
            "source": "own", "permission": "own", "credit": None, "source_url": None,
            "note": None, "added": datetime.datetime.now().isoformat(timespec="seconds"),
            **meta, "captions": caps,
            "used": False, "used_in": None, "used_at": None})
        side = p.with_suffix(".txt")
        if side.exists():
            side.rename(USED / side.name)
        p.rename(USED / p.name)
        added += 1
        tag = f"{len(caps)} captions" if caps else "NO CAPTIONS - needs a bit written"
        print(f"  + {i}  {p.name}  {meta['duration']}s {meta['width']}x{meta['height']}  [{tag}]")
    save(m)
    print(f"ingested {added} new clip(s); {len(m['clips'])} total")
    return 0

def add_url(args):
    if args.permission not in OK_PERMS and args.permission != "unknown":
        sys.exit(f"--permission must be one of {sorted(OK_PERMS)} or 'unknown'")
    CLIPS.mkdir(exist_ok=True)
    tmp = FOOT / "_dl.%(ext)s"
    r = subprocess.run(["yt-dlp", "--no-warnings", "-f",
                        "bestvideo[height<=1920]+bestaudio/best",
                        "--merge-output-format", "mp4", "-o", str(tmp), args.url],
                       capture_output=True, text=True)
    got = sorted(FOOT.glob("_dl.*"))
    if r.returncode or not got:
        print(r.stderr[-1500:], file=sys.stderr)
        sys.exit("download failed")
    src = got[0]
    i = cid(src)
    m = load()
    if any(c["id"] == i for c in m["clips"]):
        src.unlink(); sys.exit(f"already in library as {i}")
    meta = probe(src)
    dest = CLIPS / f"{i}.mp4"
    src.rename(dest)
    m["clips"].append({
        "id": i, "file": str(dest.relative_to(CH)), "orig_name": None,
        "source": args.source, "permission": args.permission, "credit": args.credit,
        "source_url": args.url, "note": args.note,
        "added": datetime.datetime.now().isoformat(timespec="seconds"),
        **meta, "captions": None,
        "used": False, "used_in": None, "used_at": None})
    save(m)
    flag = "" if args.permission in OK_PERMS else "  <-- NOT USABLE until permission is obtained"
    print(f"+ {i} {meta.get('duration')}s permission={args.permission}{flag}")
    return 0

def set_permission(args):
    m = load()
    for c in m["clips"]:
        if c["id"] == args.id:
            c["permission"] = args.permission
            if args.note: c["note"] = args.note
            if args.credit: c["credit"] = args.credit
            save(m); print(f"{args.id} -> permission={args.permission}"); return 0
    sys.exit(f"no clip {args.id}")

def set_captions(args):
    m = load()
    for c in m["clips"]:
        if c["id"] == args.id:
            c["captions"] = json.loads(args.captions)
            save(m); print(f"{args.id} -> {len(c['captions'])} captions"); return 0
    sys.exit(f"no clip {args.id}")

def usable(c):
    """Cleared for use AND has a bit written. Captions must match the footage —
    auto-generating them produces the generic videos we are trying to get away from."""
    return (not c["used"]) and c["permission"] in OK_PERMS and not c.get("error") \
        and bool(c.get("captions"))

def cleared(c):
    """Permission-cleared but may still be awaiting captions."""
    return (not c["used"]) and c["permission"] in OK_PERMS and not c.get("error")

def pick(args):
    m = load()
    cands = [c for c in m["clips"] if usable(c)]
    if args.min_duration:
        cands = [c for c in cands if (c.get("duration") or 0) >= args.min_duration]
    if not cands:
        print(json.dumps({"error": "no usable unused clips"})); return 2
    # prefer portrait, then longer (more beats to cut a bit from), then oldest
    cands.sort(key=lambda c: (-(1 if (c.get("height") or 0) > (c.get("width") or 0) else 0),
                              -(c.get("duration") or 0), c["added"]))
    print(json.dumps(cands[0], indent=1))
    return 0

def mark_used(args):
    m = load()
    for c in m["clips"]:
        if c["id"] == args.id:
            c["used"] = True; c["used_in"] = args.video_url
            c["used_at"] = datetime.datetime.now().isoformat(timespec="seconds")
            save(m); print(f"{args.id} -> used ({args.video_url})"); return 0
    sys.exit(f"no clip {args.id}")

def lst(args):
    m = load()
    if not m["clips"]:
        print("library empty — drop files in channel/footage/inbox/ then run: footage.py ingest")
        return 0
    for c in m["clips"]:
        if args.ready and not usable(c):
            continue
        if c["used"]:
            state = "USED"
        elif usable(c):
            state = "ready"
        elif cleared(c):
            state = "NEEDCAP"
        else:
            state = "BLOCKED"
        print(f'{c["id"]}  {state:7} {c["permission"]:8} {c["source"]:7} '
              f'{(c.get("duration") or 0):6.1f}s {c.get("width")}x{c.get("height")} '
              f'{c.get("orig_name") or c.get("source_url") or ""}')
    return 0

def stats(args):
    m = load(); cl = m["clips"]
    print(f"total {len(cl)} | ready {sum(1 for c in cl if usable(c))} | "
          f"needs-captions {sum(1 for c in cl if cleared(c) and not usable(c))} | "
          f"used {sum(1 for c in cl if c['used'])} | "
          f"blocked {sum(1 for c in cl if not c['used'] and c['permission'] not in OK_PERMS)}")
    for k in ("source", "permission"):
        agg = {}
        for c in cl: agg[c[k]] = agg.get(c[k], 0) + 1
        print(f"  by {k}: {agg}")
    return 0

if __name__ == "__main__":
    for d in (INBOX, USED, CLIPS): d.mkdir(parents=True, exist_ok=True)
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    sub.add_parser("ingest").set_defaults(fn=ingest)
    a = sub.add_parser("add-url"); a.set_defaults(fn=add_url)
    a.add_argument("--url", required=True)
    a.add_argument("--permission", default="unknown")
    a.add_argument("--source", default="reddit")
    a.add_argument("--credit"); a.add_argument("--note")
    a = sub.add_parser("set-permission"); a.set_defaults(fn=set_permission)
    a.add_argument("--id", required=True); a.add_argument("--permission", required=True)
    a.add_argument("--note"); a.add_argument("--credit")
    a = sub.add_parser("set-captions"); a.set_defaults(fn=set_captions)
    a.add_argument("--id", required=True)
    a.add_argument("--captions", required=True, help='JSON [["text",start,end],...]')
    a = sub.add_parser("pick"); a.set_defaults(fn=pick)
    a.add_argument("--min-duration", type=float, default=0)
    a = sub.add_parser("mark-used"); a.set_defaults(fn=mark_used)
    a.add_argument("--id", required=True); a.add_argument("--video-url", default=None)
    a = sub.add_parser("list"); a.set_defaults(fn=lst); a.add_argument("--ready", action="store_true")
    sub.add_parser("stats").set_defaults(fn=stats)
    args = ap.parse_args()
    sys.exit(args.fn(args))
