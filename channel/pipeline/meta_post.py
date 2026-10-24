#!/usr/bin/env python3
"""Post rendered originals to Facebook Page Reels and Instagram Reels via the Meta Graph API.

Free alternative to Upload-Post's paid tier for Meta. TikTok is NOT covered here —
its Content Posting API restricts unaudited clients to private-only posts.

Credentials live in config.toml under [meta]; see config.example.toml.

Facebook takes a direct binary upload. Instagram only accepts a public video_url,
so we serve storage/tasks/ over a throwaway cloudflared tunnel for the duration of
the run and tear it down afterwards.
"""
import argparse, json, re, subprocess, sys, time, tomllib
from contextlib import contextmanager
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
TASKS = ROOT / "storage" / "tasks"
GRAPH = "https://graph.facebook.com/v21.0"
PORT = 8731

sys.path.insert(0, str(Path(__file__).parent))
from crosspost import originals  # same own-footage selection, one source of truth


def load_meta_cfg():
    cfg = tomllib.load(open(ROOT / "config.toml", "rb")).get("meta", {})
    missing = [k for k in ("page_token", "page_id", "ig_user_id") if not cfg.get(k)]
    if missing:
        sys.exit(f"config.toml [meta] is missing: {', '.join(missing)}")
    return cfg


def _check(resp, what):
    """Graph API returns 200 with an `error` body often enough to check both."""
    try:
        body = resp.json()
    except ValueError:
        body = {"raw": resp.text[:500]}
    if resp.status_code >= 400 or "error" in body:
        raise RuntimeError(f"{what} failed [{resp.status_code}]: {body}")
    return body


# ---------------------------------------------------------------- facebook

def post_facebook(cfg, video, caption):
    """3-phase reel upload: start -> binary rupload -> finish."""
    token = cfg["page_token"]
    start = _check(requests.post(
        f"{GRAPH}/{cfg['page_id']}/video_reels",
        data={"upload_phase": "start", "access_token": token}, timeout=60),
        "fb start")
    video_id, upload_url = start["video_id"], start["upload_url"]

    size = video.stat().st_size
    with open(video, "rb") as fh:
        _check(requests.post(upload_url, headers={
            "Authorization": f"OAuth {token}",
            "offset": "0",
            "file_size": str(size),
            "Content-Type": "application/octet-stream",
        }, data=fh, timeout=600), "fb upload")

    _check(requests.post(
        f"{GRAPH}/{cfg['page_id']}/video_reels",
        data={"upload_phase": "finish", "video_id": video_id,
              "video_state": "PUBLISHED", "description": caption,
              "access_token": token}, timeout=120),
        "fb finish")
    return video_id


# --------------------------------------------------------------- instagram

@contextmanager
def public_tunnel(directory):
    """Serve `directory` on a throwaway trycloudflare.com URL. Both procs die on exit."""
    server = subprocess.Popen(
        [sys.executable, "-m", "http.server", str(PORT), "--directory", str(directory)],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    tunnel = subprocess.Popen(
        ["cloudflared", "tunnel", "--url", f"http://localhost:{PORT}"],
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
    try:
        url = None
        deadline = time.time() + 60
        while time.time() < deadline:
            line = tunnel.stdout.readline()
            if not line and tunnel.poll() is not None:
                break
            m = re.search(r"https://[\w-]+\.trycloudflare\.com", line)
            if m:
                url = m.group(0)
                break
        if not url:
            raise RuntimeError("cloudflared did not produce a tunnel URL within 60s")
        # The trycloudflare edge answers 530 for ~25-30s before it goes live.
        # Measured, not guessed - do not shorten this window.
        ready = time.time() + 120
        while time.time() < ready:
            try:
                if requests.head(url, timeout=10).status_code < 500:
                    break
            except requests.RequestException:
                pass
            time.sleep(3)
        else:
            raise RuntimeError(f"tunnel {url} never became reachable within 120s")
        print(f"[tunnel] {url}")
        yield url
    finally:
        tunnel.terminate(), server.terminate()
        tunnel.wait(timeout=10), server.wait(timeout=10)


def post_instagram(cfg, video_url, caption):
    """Container -> poll until FINISHED -> publish. Publishing early returns an error."""
    token = cfg["page_token"]
    ig = cfg["ig_user_id"]
    container = _check(requests.post(
        f"{GRAPH}/{ig}/media",
        data={"media_type": "REELS", "video_url": video_url,
              "caption": caption, "access_token": token}, timeout=120),
        "ig container")["id"]

    deadline = time.time() + 300
    while time.time() < deadline:
        status = _check(requests.get(
            f"{GRAPH}/{container}",
            params={"fields": "status_code,status", "access_token": token}, timeout=30),
            "ig status")
        code = status.get("status_code")
        if code == "FINISHED":
            break
        if code == "ERROR":
            raise RuntimeError(f"ig container error: {status.get('status')}")
        time.sleep(5)
    else:
        raise RuntimeError("ig container never finished processing within 5m")

    return _check(requests.post(
        f"{GRAPH}/{ig}/media_publish",
        data={"creation_id": container, "access_token": token}, timeout=120),
        "ig publish")["id"]


# -------------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--platforms", nargs="+", default=["facebook", "instagram"],
                    choices=["facebook", "instagram"])
    ap.add_argument("--hashtags", default="#cats #cat #kitten #catlover #reels")
    ap.add_argument("--only", nargs="+", help="limit to these clip ids")
    ap.add_argument("--dry-run", action="store_true")
    a = ap.parse_args()

    items = [(cid, Path(v), t) for cid, v, t in originals()
             if not a.only or cid in a.only]
    if not items:
        sys.exit("no matching originals found")

    if a.dry_run:
        for cid, video, title in items:
            print(f"[dry-run] {cid} -> {a.platforms}: {title!r} ({video.name})")
        return 0

    cfg = load_meta_cfg()
    rc = 0

    if "facebook" in a.platforms:
        for cid, video, title in items:
            try:
                vid = post_facebook(cfg, video, f"{title}\n\n{a.hashtags}")
                print(f"[fb:{cid}] ok -> video_id {vid}")
            except Exception as e:
                print(f"[fb:{cid}] FAILED: {e}", file=sys.stderr)
                rc = 1

    if "instagram" in a.platforms:
        with public_tunnel(TASKS) as base:
            for cid, video, title in items:
                try:
                    mid = post_instagram(cfg, f"{base}/{video.name}",
                                         f"{title}\n\n{a.hashtags}")
                    print(f"[ig:{cid}] ok -> media_id {mid}")
                except Exception as e:
                    print(f"[ig:{cid}] FAILED: {e}", file=sys.stderr)
                    rc = 1
    return rc


if __name__ == "__main__":
    sys.exit(main())
