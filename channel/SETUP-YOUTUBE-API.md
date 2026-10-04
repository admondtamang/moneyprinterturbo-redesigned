# One-time: YouTube Data API upload access (~15 min, your action)

Needed because Upload-Post caps at 10 uploads/month and 4GB/file. Daily posting needs ~30/month.
The API has no monthly cap (10,000 units/day; an upload costs ~1,600 → ~6 uploads/day) and
handles multi-GB files via resumable upload.

## Steps

1. Go to https://console.cloud.google.com/ and create a project (any name).
2. APIs & Services → Library → enable **YouTube Data API v3**.
3. APIs & Services → OAuth consent screen:
   - User type: **External**
   - Fill app name / your email. Add yourself under **Test users**.
   - You do NOT need Google verification — test-user mode is fine for your own channel.
4. APIs & Services → Credentials → Create credentials → **OAuth client ID**
   - Application type: **Desktop app**
   - Download the JSON.
5. Save it as:
   `/home/zmond/MoneyPrinterTurbo/channel/pipeline/client_secret.json`
6. Run the one-time consent flow (opens a browser, sign in as the @thecatcourt owner):
   ```
   cd /home/zmond/MoneyPrinterTurbo
   ./.venv/bin/python channel/pipeline/youtube_upload.py --auth
   ```
7. Switch the pipeline over — in `channel/config.yaml`:
   ```yaml
   upload:
     backend: "youtube_api"
   ```

## Notes
- `client_secret.json` and `token.json` are credentials. Do NOT commit them. Add to .gitignore.
- Token auto-refreshes; you only do this once unless you revoke access.
- In test-user mode the refresh token can expire after 7 days of disuse — if uploads start
  failing with an auth error, re-run step 6.
- Quota is per-project per-day and resets at midnight Pacific.
