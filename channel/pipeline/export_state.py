#!/usr/bin/env python3
"""Dump pipeline state as JSON for the dashboard."""
import json, subprocess, sys, datetime
from pathlib import Path
import yaml

CH = Path("/home/zmond/MoneyPrinterTurbo/channel")
sys.path.insert(0, str(CH / "pipeline"))
import footage as F

def views(vid):
    try:
        o = subprocess.run(["yt-dlp","--skip-download","--no-warnings","--print",
                            "%(view_count)s|%(like_count)s|%(duration)s|%(title)s",
                            f"https://www.youtube.com/watch?v={vid}"],
                           capture_output=True, text=True, timeout=90).stdout.strip()
        v,l,d,t = o.split("|",3)
        return {"views": int(v) if v.isdigit() else 0,
                "likes": int(l) if l.isdigit() else None,
                "duration": float(d) if d.replace('.','',1).isdigit() else None, "title": t}
    except Exception:
        return None

ideas = yaml.safe_load((CH/"ideas.yaml").read_text())
cfg   = yaml.safe_load((CH/"config.yaml").read_text())
fm    = F.load()

uploads = []
up = CH/"logs/uploads.jsonl"
if up.exists():
    for line in up.read_text().strip().splitlines():
        try: uploads.append(json.loads(line))
        except Exception: pass

# published videos, newest first
published, seen = [], set()
for e in reversed(uploads):
    if e.get("status") != "uploaded": continue
    r = e.get("response") or {}
    url = r.get("url") or ""
    vid = url.split("v=")[-1] if "v=" in url else None
    key = vid or e.get("idea") or e.get("clip")
    if key in seen: continue
    seen.add(key)
    published.append({"idea": e.get("idea") or e.get("clip"), "title": e.get("title"),
                      "ts": e.get("ts"), "video_id": vid, "url": url or None,
                      "source": e.get("source","script"), "stats": views(vid) if vid else None})

# pre-pipeline manual uploads, for the full Done picture
for vid, tag in [("QWB9hNSf8jM","manual"), ("E3pzkvnXEWI","manual")]:
    if vid not in seen:
        s = views(vid)
        published.append({"idea": None, "title": s["title"] if s else vid, "ts": None,
                          "video_id": vid, "url": f"https://www.youtube.com/watch?v={vid}",
                          "source": tag, "stats": s})

try:
    chan = json.loads(subprocess.run(["yt-dlp","--flat-playlist","--no-warnings","-J",
        "https://www.youtube.com/@thecatcourt"], capture_output=True, text=True,
        timeout=180).stdout)
    subs = chan.get("channel_follower_count")
except Exception:
    subs = None

nxt = subprocess.run(["systemctl","--user","list-timers","catcourt-produce.timer",
                      "--no-pager"], capture_output=True, text=True).stdout
next_run = next((l.split("  ")[0].strip() for l in nxt.splitlines()
                 if "catcourt-produce" in l), None)

state = {
 "generated": datetime.datetime.now().isoformat(timespec="seconds"),
 "channel": {"handle":"thecatcourt","subs":subs,
             "total_views": sum((p["stats"] or {}).get("views",0) for p in published)},
 "next_run": next_run,
 "paused": bool(cfg["schedule"].get("pause")),
 "backend": cfg["upload"].get("backend"),
 "queue": [{"id":i["id"],"title":i["title"],"used":bool(i.get("used")),
            "terms":i.get("terms"),"lines":len(i.get("script") or [])} for i in ideas],
 "footage": [{"id":c["id"],"name":c.get("orig_name") or c.get("source_url"),
              "source":c["source"],"permission":c["permission"],
              "duration":c.get("duration"),"w":c.get("width"),"h":c.get("height"),
              "captions":len(c.get("captions") or []),
              "state":("used" if c["used"] else "ready" if F.usable(c)
                       else "needs_captions" if F.cleared(c) else "blocked"),
              "used_in":c.get("used_in")} for c in fm["clips"]],
 "published": published,
 "blockers": [
   {"what":"Rotate the leaked Upload-Post API key","why":"Leaked into a chat transcript 2026-10-01; still live","sev":"high"},
   {"what":"Music bed is the wrong mood","why":"Comedy bits are using the sleepy ambient synth built for the 3.5h video","sev":"med"},
   {"what":"YouTube Studio analytics (CTR, retention)","why":"Public metadata cannot say whether weak videos fail on thumbnail or retention","sev":"med"},
   {"what":"Your own cat footage","why":"Highest-leverage input. Stock cannot produce candid comedy moments","sev":"high"},
 ],
}
out = CH/"logs/state.json"
out.write_text(json.dumps(state, indent=1))
print(json.dumps({k:(len(v) if isinstance(v,list) else v) for k,v in state.items()
                  if k in ("generated","channel","next_run","queue","footage","published")}, indent=1))
