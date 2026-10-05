#!/usr/bin/env python3
"""Project resolution for the shared pipeline.

One codebase, many channels. Every script resolves its data root through here instead of
hardcoding a path, so adding a channel means adding a directory + a registry entry.

Resolution order:  --project flag  ->  $CC_PROJECT  ->  "catcourt" (the default).
"""
import os, sys
from pathlib import Path

ROOT = Path("/home/zmond/MoneyPrinterTurbo")
REGISTRY = ROOT / "projects.yaml"
DEFAULT = "catcourt"

def _load():
    import yaml
    if not REGISTRY.exists():
        return {"projects": {DEFAULT: {"root": "channel"}}}
    return yaml.safe_load(REGISTRY.read_text()) or {"projects": {}}

def names():
    return list(_load().get("projects", {}).keys())

def meta(name=None):
    name = name or current_name()
    p = _load().get("projects", {}).get(name)
    if not p:
        sys.exit(f"unknown project '{name}'. Known: {', '.join(names())}")
    return {"name": name, **p}

def current_name(argv=None):
    """Read --project from argv or $CC_PROJECT without disturbing the caller's parser."""
    argv = argv if argv is not None else sys.argv
    for i, a in enumerate(argv):
        if a == "--project" and i + 1 < len(argv):
            return argv[i + 1]
        if a.startswith("--project="):
            return a.split("=", 1)[1]
    return os.environ.get("CC_PROJECT", DEFAULT)

def root(name=None):
    return ROOT / meta(name)["root"]

def strip_project_args(argv=None):
    """Remove --project/--project=X so existing argparse setups keep working."""
    argv = list(argv if argv is not None else sys.argv[1:])
    out, skip = [], False
    for a in argv:
        if skip:
            skip = False; continue
        if a == "--project":
            skip = True; continue
        if a.startswith("--project="):
            continue
        out.append(a)
    return out

if __name__ == "__main__":
    for n in names():
        m = meta(n)
        print(f'{n:12} root={m["root"]:18} handle={m.get("handle")} '
              f'status={m.get("status")} niche={m.get("niche")}')
