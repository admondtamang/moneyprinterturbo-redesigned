#!/usr/bin/env python3
"""Cross-post already-rendered original clips (own footage) to TikTok/Instagram/Facebook.

YouTube is handled by produce.py; this only fans the same renders out to the other
platforms via Upload-Post. Requires those accounts linked on the upload-post profile.
"""
import argparse, json, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CH = ROOT / "channel"
TASKS = ROOT / "storage" / "tasks"


def originals():
    """Own-footage clips that have a rendered bit-*.mp4, newest title from uploads.jsonl."""
    state = json.loads((CH / "logs" / "state.json").read_text())
    titles = {}
    for line in (CH / "logs" / "uploads.jsonl").read_text().splitlines():
        rec = json.loads(line)
        if rec.get("clip"):
            titles[rec["clip"]] = rec["title"]
    for f in state["footage"]:
        if f["source"] != "own":
            continue
        video = TASKS / f"bit-{f['id']}.mp4"
        if video.exists():
            yield f["id"], str(video), titles.get(f["id"], f["name"])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--platforms", nargs="+", default=["tiktok", "instagram", "facebook"])
    ap.add_argument("--hashtags", default="#cats #cat #kitten #catlover")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    sys.path.insert(0, str(ROOT))
    from app.services.upload_post import UploadPostService
    svc = UploadPostService()

    rc = 0
    for cid, video, title in originals():
        caption = f"{title}\n\n{a.hashtags}"
        if a.dry_run:
            print(f"[dry-run] {cid} -> {a.platforms}: {caption!r} ({video})")
            continue
        res = svc.upload_video(video_path=video, title=caption, platforms=a.platforms)
        ok = res.get("success")
        print(f"[{cid}] {'ok' if ok else 'FAILED'}: {res}")
        if not ok:
            rc = 1
    return rc


if __name__ == "__main__":
    sys.exit(main())
