#!/usr/bin/env python3
"""Export dashboard state for EVERY project in projects.yaml into one document."""
import json, subprocess, sys, datetime, os
from pathlib import Path

HERE = Path(__file__).parent
sys.path.insert(0, str(HERE))
import projects as P

OUT = Path("/home/zmond/MoneyPrinterTurbo/channel/logs/all_state.json")

def export(name):
    env = dict(os.environ, CC_PROJECT=name)
    r = subprocess.run([sys.executable, str(HERE / "export_state.py")],
                       capture_output=True, text=True, env=env,
                       cwd="/home/zmond/MoneyPrinterTurbo", timeout=1800)
    f = P.root(name) / "logs" / "state.json"
    if not f.exists():
        return {"error": r.stderr[-400:] or "no state produced"}
    s = json.loads(f.read_text())
    nr = s.get("next_run") or ""
    import re
    m = re.match(r'^([A-Z][a-z]{2} \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})', nr)
    s["next_run"] = m.group(1) if m else None
    return s

if __name__ == "__main__":
    doc = {"generated": datetime.datetime.now().isoformat(timespec="seconds"),
           "projects": []}
    for n in P.names():
        meta = P.meta(n)
        print(f"exporting {n}...", flush=True)
        st = export(n) if meta.get("status") != "scaffolding" or (P.root(n)/"logs").exists() else {}
        doc["projects"].append({
            "name": n, "handle": meta.get("handle"), "url": meta.get("url"),
            "niche": meta.get("niche"), "status": meta.get("status"),
            "started": str(meta.get("started")) if meta.get("started") else None, "state": st})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, indent=1, default=str))
    for p in doc["projects"]:
        st = p["state"] or {}
        print(f'  {p["name"]:10} {p["status"]:12} '
              f'published={len(st.get("published") or [])} '
              f'queue={len([q for q in (st.get("queue") or []) if not q.get("used")])} '
              f'footage={len(st.get("footage") or [])}')
    print("->", OUT)
