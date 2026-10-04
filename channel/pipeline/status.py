#!/usr/bin/env python3
"""Twice-daily channel status. Pulls public stats, diffs against the last snapshot,
desktop-notifies, and appends to logs/status.jsonl. No Claude session required."""
import json, subprocess, datetime, sys
from pathlib import Path

CH = Path("/home/zmond/MoneyPrinterTurbo/channel")
LOGS = CH / "logs"; LOGS.mkdir(exist_ok=True)
SNAP = LOGS / "snapshot.json"

def pull():
    out = subprocess.run(
        ["yt-dlp", "--flat-playlist", "--no-warnings",
         "--print", "%(id)s|%(view_count)s|%(title)s",
         "https://www.youtube.com/@thecatcourt/shorts"],
        capture_output=True, text=True, timeout=600).stdout.strip().splitlines()
    vids = {}
    for ln in out:
        p = ln.split("|", 2)
        if len(p) == 3 and p[1].isdigit():
            vids[p[0]] = {"views": int(p[1]), "title": p[2]}
    subs = None
    try:
        j = json.loads(subprocess.run(
            ["yt-dlp", "--flat-playlist", "--no-warnings", "-J",
             "https://www.youtube.com/@thecatcourt"],
            capture_output=True, text=True, timeout=600).stdout)
        subs = j.get("channel_follower_count")
    except Exception:
        pass
    return {"ts": datetime.datetime.now().isoformat(), "subs": subs, "videos": vids}

def main():
    cur = pull()
    if not cur["videos"]:
        subprocess.run(["notify-send", "-u", "critical", "thecatcourt",
                        "status check failed: no videos returned"])
        return 1
    prev = json.loads(SNAP.read_text()) if SNAP.exists() else None
    total = sum(v["views"] for v in cur["videos"].values())

    lines = []
    if prev:
        ptot = sum(v["views"] for v in prev["videos"].values())
        dt = (datetime.datetime.fromisoformat(cur["ts"])
              - datetime.datetime.fromisoformat(prev["ts"])).total_seconds() / 3600
        dv = total - ptot
        ds = (cur["subs"] or 0) - (prev["subs"] or 0)
        lines.append(f"+{dv:,} views, +{ds} subs in {dt:.0f}h")
        # per-video movers
        mov = sorted(((cur["videos"][k]["views"] - prev["videos"].get(k, {}).get("views", 0), k)
                      for k in cur["videos"]), reverse=True)[:2]
        for d, k in mov:
            if d > 0:
                lines.append(f"  {d:+,} {cur['videos'][k]['title'][:40]}")
        new = set(cur["videos"]) - set(prev["videos"])
        for k in new:
            lines.append(f"  NEW {cur['videos'][k]['title'][:40]} ({cur['videos'][k]['views']})")
    else:
        lines.append("first snapshot")

    # last pipeline run
    up = LOGS / "uploads.jsonl"
    if up.exists():
        last = json.loads(up.read_text().strip().splitlines()[-1])
        lines.append(f"last run: {last.get('status')} ({last.get('idea','-')})")

    # remaining ideas
    try:
        import yaml
        ideas = yaml.safe_load((CH / "ideas.yaml").read_text())
        left = sum(1 for i in ideas if not i.get("used"))
        lines.append(f"{left} ideas queued")
        if left <= 2:
            lines.append("!! ADD IDEAS to channel/ideas.yaml")
    except Exception:
        pass

    # footage library state
    try:
        sys.path.insert(0, str(CH / "pipeline"))
        import footage as F
        fm = F.load()
        ready = sum(1 for c in fm["clips"] if F.usable(c))
        needcap = sum(1 for c in fm["clips"] if F.cleared(c) and not F.usable(c))
        blocked = sum(1 for c in fm["clips"]
                      if not c["used"] and c["permission"] not in F.OK_PERMS)
        lines.append(f"footage: {ready} ready, {needcap} need captions, {blocked} blocked")
        if needcap:
            lines.append("!! clips waiting on captions — see footage/README.md")
        if ready == 0:
            lines.append("!! no footage ready — pipeline will use stock")
    except Exception as e:
        lines.append(f"footage: check failed ({type(e).__name__})")

    msg = "\n".join(lines)
    print(f"[{cur['ts']}] subs={cur['subs']} total_views={total:,}\n{msg}")
    urgency = "critical" if "!!" in msg else "normal"
    subprocess.run(["notify-send", "-u", urgency,
                    f"thecatcourt — {cur['subs']} subs, {total:,} views", msg])
    with (LOGS / "status.jsonl").open("a") as f:
        f.write(json.dumps({"ts": cur["ts"], "subs": cur["subs"], "total_views": total}) + "\n")
    SNAP.write_text(json.dumps(cur, indent=1))
    return 0

if __name__ == "__main__":
    sys.exit(main())
