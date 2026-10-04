#!/usr/bin/env python3
"""Direct YouTube Data API uploader — resumable, no size cap, no monthly quota ceiling
(10,000 API units/day; an upload costs ~1,600, so ~6 uploads/day).

One-time auth:   ./.venv/bin/python channel/pipeline/youtube_upload.py --auth
Then produce.py can use backend: youtube_api in config.yaml.

Needs channel/pipeline/client_secret.json — see channel/SETUP-YOUTUBE-API.md
"""
import argparse, json, sys
from pathlib import Path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

HERE = Path(__file__).parent
SECRET = HERE / "client_secret.json"
TOKEN = HERE / "token.json"
SCOPES = ["https://www.googleapis.com/auth/youtube.upload"]

def creds():
    c = None
    if TOKEN.exists():
        c = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)
    if c and c.expired and c.refresh_token:
        c.refresh(Request()); TOKEN.write_text(c.to_json())
    if not c or not c.valid:
        if not SECRET.exists():
            sys.exit(f"missing {SECRET} — see channel/SETUP-YOUTUBE-API.md")
        flow = InstalledAppFlow.from_client_secrets_file(str(SECRET), SCOPES)
        c = flow.run_local_server(port=0, prompt="consent")
        TOKEN.write_text(c.to_json()); TOKEN.chmod(0o600)
        print(f"saved {TOKEN}")
    return c

def upload(path, title, description, tags, privacy="public", synthetic=True,
           category="15"):          # 15 = Pets & Animals
    yt = build("youtube", "v3", credentials=creds())
    body = {"snippet": {"title": title[:100], "description": description,
                        "tags": tags, "categoryId": category},
            "status": {"privacyStatus": privacy, "selfDeclaredMadeForKids": False,
                       "containsSyntheticMedia": synthetic}}
    def _go(b):
        media = MediaFileUpload(path, chunksize=8 * 1024 * 1024, resumable=True,
                                mimetype="video/mp4")
        req = yt.videos().insert(part="snippet,status", body=b, media_body=media)
        resp = None
        while resp is None:
            st, resp = req.next_chunk()
            if st:
                print(f"  {int(st.progress()*100)}%", flush=True)
        return resp

    try:
        resp = _go(body)
    except Exception as e:
        # containsSyntheticMedia is not accepted on every API version; retry without it
        # rather than lose the upload. Disclosure then has to be set in YouTube Studio.
        if "containsSyntheticMedia" in str(e) or "invalid" in str(e).lower():
            body["status"].pop("containsSyntheticMedia", None)
            print("  note: API rejected containsSyntheticMedia; retrying without it. "
                  "Set the AI-disclosure toggle in YouTube Studio.", flush=True)
            resp = _go(body)
        else:
            raise
    return {"success": True, "video_id": resp["id"],
            "url": f"https://www.youtube.com/watch?v={resp['id']}",
            "synthetic_declared": "containsSyntheticMedia" in body["status"]}

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--auth", action="store_true", help="run the one-time consent flow")
    ap.add_argument("--video"); ap.add_argument("--title")
    ap.add_argument("--description", default=""); ap.add_argument("--tags", default="")
    a = ap.parse_args()
    if a.auth:
        creds(); print("authorized."); sys.exit(0)
    if not a.video:
        sys.exit("--video required (or --auth)")
    print(json.dumps(upload(a.video, a.title, a.description,
                            [t for t in a.tags.split(",") if t]), indent=1))
