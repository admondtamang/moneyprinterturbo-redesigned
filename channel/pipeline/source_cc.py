#!/usr/bin/env python3
"""Find and ingest Creative Commons licensed cat clips — legally reusable with credit.

Why CC-BY and not "edit it enough": editing and crediting do not grant a licence. A CC-BY
licence does — the uploader explicitly permits reuse, commercial included, with attribution.
That satisfies both copyright AND the YPP Reused Content bar, provided we still add our own
edit and commentary (the bit captions do that).

CAVEAT the tool cannot settle: the CC label is self-declared by the uploader. Someone who
re-uploaded stolen footage and ticked "Creative Commons" has not licensed anything. This
filters toward original-looking source material and flags likely compilations, but a human
should eyeball the candidate before it is published.

  find     search CC-filtered YouTube, verify licence, rank, report
  grab     download one, check for watermarks, register it in the library with credit
"""
import argparse, json, subprocess, sys, re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import projects as _P
CH = _P.root()                    # --project / $CC_PROJECT aware
CC = "Creative Commons Attribution license (reuse allowed)"
COMPILATION_HINT = re.compile(
    r"compilation|best of|funniest|top \d+|\bmix\b|tiktok|#\d+|ultimate|moments", re.I)

def _run(cmd, t=300):
    return subprocess.run(cmd, capture_output=True, text=True, timeout=t).stdout

def search(query, pages=1):
    """YouTube search with the Creative Commons filter (sp=EgIwAQ%3D%3D)."""
    url = ("https://www.youtube.com/results?search_query="
           + query.replace(" ", "+") + "&sp=EgIwAQ%253D%253D")
    out = _run(["yt-dlp", "--no-warnings", "--flat-playlist",
                "--playlist-end", str(25 * pages),
                "--print", "%(id)s|%(duration)s|%(view_count)s|%(title)s", url], 600)
    rows = []
    for ln in out.strip().splitlines():
        p = ln.split("|", 3)
        if len(p) == 4:
            rows.append({"id": p[0],
                         "duration": float(p[1]) if p[1].replace('.','',1).isdigit() else None,
                         "views": int(p[2]) if p[2].isdigit() else 0,
                         "title": p[3]})
    return rows

def verify(vid):
    """Full extract — licence is NOT present in flat-playlist output."""
    out = _run(["yt-dlp", "--skip-download", "--no-warnings", "--print",
                "%(license)s\t%(uploader)s\t%(uploader_url)s\t%(duration)s\t%(view_count)s"
                "\t%(width)s\t%(height)s\t%(title)s",
                f"https://www.youtube.com/watch?v={vid}"], 180)
    f = out.strip().split("\t")
    if len(f) < 8:
        return None
    return {"id": vid, "license": f[0], "uploader": f[1], "uploader_url": f[2],
            "duration": float(f[3]) if f[3].replace('.','',1).isdigit() else None,
            "views": int(f[4]) if f[4].isdigit() else 0,
            "width": int(f[5]) if f[5].isdigit() else None,
            "height": int(f[6]) if f[6].isdigit() else None, "title": f[7]}

def watermark_scan(path, samples=60, out_png=None):
    """Detect persistent overlays (watermarks, channel bugs, burned-in captions).

    Method: average many frames. Changing scenes blur to mush; anything burned into every
    frame stays sharp. Text then shows up as strong localised gradient in the mean image,
    which averaged footage does not produce. Verified to fire on a known watermark
    (the "Fluffel" bug) and stay quiet on clean footage.

    Writes the mean image when out_png is given — always eyeball it before publishing.
    """
    import numpy as np
    dur = float(_run(["ffprobe","-v","error","-show_entries","format=duration",
                      "-of","csv=p=0", str(path)]).strip() or 0)
    if dur <= 0:
        return {"error": "no duration"}
    W, H = 360, 640
    fps = max(min(samples / dur, 8.0), 0.15)
    raw = subprocess.run(
        ["ffmpeg","-v","error","-i",str(path),"-vf",f"fps={fps:.4f},scale={W}:{H}",
         "-frames:v",str(samples),"-f","rawvideo","-pix_fmt","gray","-"],
        capture_output=True).stdout
    k = len(raw) // (W*H)
    if k < 8:
        return {"error": f"only {k} frames sampled", "likely_watermark": None}
    a = np.frombuffer(raw[:k*W*H], "uint8").reshape(k, H, W).astype(float)
    m = a.mean(axis=0)
    lo, hi = np.percentile(m, 2), np.percentile(m, 98)
    stretched = np.clip((m - lo) / (hi - lo + 1e-9), 0, 1)

    if out_png:
        try:
            from PIL import Image
            Image.fromarray((stretched*255).astype("uint8")).save(out_png)
        except Exception:
            out_png = None

    gy, gx = np.gradient(stretched)
    grad = np.hypot(gx, gy)
    bh, bw = H // 16, W // 9
    blocks = {}
    for by in range(16):
        for bx in range(9):
            blocks[(by, bx)] = float(grad[by*bh:(by+1)*bh, bx*bw:(bx+1)*bw].mean())
    vals = np.array(list(blocks.values()))
    med = float(np.median(vals)) + 1e-9
    # overlays live at the edges: top/bottom two rows, or the outer columns
    edge = {k_: v for k_, v in blocks.items()
            if k_[0] <= 1 or k_[0] >= 14 or k_[1] == 0 or k_[1] == 8}
    hot = sorted(((v / med, k_) for k_, v in edge.items()), reverse=True)
    worst_ratio, worst_block = hot[0]
    suspects = [{"row": f"{b[0]}/16", "col": f"{b[1]}/9", "ratio": round(r, 2)}
                for r, b in hot if r >= 2.0][:4]
    return {"frames": k, "median_gradient": round(med, 4),
            "worst_edge_block": {"row": f"{worst_block[0]}/16",
                                 "col": f"{worst_block[1]}/9",
                                 "ratio": round(worst_ratio, 2)},
            "suspects": suspects,
            "likely_watermark": bool(suspects),
            "mean_image": out_png}

def cmd_find(a):
    raw = search(a.query, a.pages)
    raw = [r for r in raw if r["duration"] and a.min_dur <= r["duration"] <= a.max_dur]
    raw.sort(key=lambda r: -r["views"])
    print(f"{len(raw)} candidates in {a.min_dur}-{a.max_dur}s; verifying licence on top {a.check}...\n")
    ok = []
    for r in raw[:a.check]:
        v = verify(r["id"])
        if not v:
            continue
        licensed = v["license"] == CC
        comp = bool(COMPILATION_HINT.search(v["title"]))
        flag = "CC-BY" if licensed else "not-CC"
        note = " COMPILATION?" if comp else ""
        print(f'  [{flag:6}] {v["views"]:>9,} {v["duration"]:>6.0f}s  '
              f'{v["width"]}x{v["height"]}  {v["uploader"][:22]:22} {v["title"][:46]}{note}')
        if licensed and not comp:
            ok.append(v)
    print(f"\n{len(ok)} usable (CC-BY, original-looking).")
    if ok:
        (CH/"logs").mkdir(exist_ok=True)
        (CH/"logs/cc_candidates.json").write_text(json.dumps(ok, indent=1))
        print("saved -> channel/logs/cc_candidates.json")
        print("\ngrab one with:")
        print(f'  ./.venv/bin/python channel/pipeline/source_cc.py grab --id {ok[0]["id"]}')
    return 0

def cmd_grab(a):
    v = verify(a.id)
    if not v:
        sys.exit("could not read that video")
    if v["license"] != CC and not a.allow_unlicensed:
        sys.exit(f'licence is "{v["license"]}" — not CC-BY. Refusing.\n'
                 "Editing and crediting do not grant a licence; get the uploader's permission "
                 "and register it with footage.py add-url --permission granted.")
    tmp = CH / "footage" / f"_cc_{a.id}.mp4"
    r = subprocess.run(["yt-dlp","--no-warnings","-f",
                        "bestvideo[height<=1920]+bestaudio/best","--merge-output-format","mp4",
                        "-o", str(tmp), f"https://www.youtube.com/watch?v={a.id}"],
                       capture_output=True, text=True)
    if r.returncode or not tmp.exists():
        print(r.stderr[-1200:], file=sys.stderr); sys.exit("download failed")

    wm_png = str(CH / "logs" / f"wm_{a.id}.png")
    (CH / "logs").mkdir(exist_ok=True)
    wm = watermark_scan(tmp, out_png=wm_png)
    print(json.dumps(wm, indent=1))
    if wm.get("likely_watermark") and not a.ignore_watermark:
        tmp.unlink()
        sys.exit(f"Persistent overlay detected (ratio "
                 f"{wm['worst_edge_block']['ratio']}x at row {wm['worst_edge_block']['row']}, "
                 f"col {wm['worst_edge_block']['col']}). Looks watermarked — deleted.\n"
                 f"Look at {wm_png} to confirm, then re-run with --ignore-watermark to keep it.")

    sys.path.insert(0, str(CH / "pipeline"))
    import footage as F
    i = F.cid(tmp)
    m = F.load()
    if any(c["id"] == i for c in m["clips"]):
        tmp.unlink(); sys.exit(f"already in library as {i}")
    dest = F.CLIPS / f"{i}.mp4"
    tmp.rename(dest)
    meta = F.probe(dest)
    credit = f'{v["uploader"]} — {v["uploader_url"]}'
    m["clips"].append({
        "id": i, "file": str(dest.relative_to(CH)), "orig_name": None,
        "source": "youtube_cc", "permission": "licensed", "credit": credit,
        "source_url": f"https://www.youtube.com/watch?v={a.id}",
        "note": f'CC-BY per YouTube. Title: {v["title"][:120]}',
        "added": __import__("datetime").datetime.now().isoformat(timespec="seconds"),
        **meta, "captions": None, "watermark_scan": wm,
        "used": False, "used_in": None, "used_at": None})
    F.save(m)
    print(f'\n+ {i}  {meta["duration"]}s {meta["width"]}x{meta["height"]}')
    print(f'  credit: {credit}')
    print("  NEEDS CAPTIONS before the pipeline will use it.")
    return 0

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    sub = ap.add_subparsers(dest="cmd", required=True)
    f = sub.add_parser("find"); f.set_defaults(fn=cmd_find)
    f.add_argument("--query", default="cat")
    f.add_argument("--pages", type=int, default=1)
    f.add_argument("--min-dur", type=float, default=4)
    f.add_argument("--max-dur", type=float, default=90)
    f.add_argument("--check", type=int, default=12)
    g = sub.add_parser("grab"); g.set_defaults(fn=cmd_grab)
    g.add_argument("--id", required=True)
    g.add_argument("--ignore-watermark", action="store_true")
    g.add_argument("--allow-unlicensed", action="store_true")
    a = ap.parse_args(_P.strip_project_args())
    sys.exit(a.fn(a))
