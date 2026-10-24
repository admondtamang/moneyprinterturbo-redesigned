#!/usr/bin/env bash
# One frame per beat -> a single contact sheet, plus a 360px-wide readability strip.
# This is the critique gate from docs/motion-rules.md. Render a DRAFT (half scale) so the
# loop stays fast; the full CRF-16 render only happens once every axis scores 8+.
#
# Usage: scripts/contact-sheet.sh [CompositionId] [round]
set -euo pipefail
cd "$(dirname "$0")/.."

COMP="${1:-TheCatCourt01}"
ROUND="${2:-1}"
OUT="out/review/round-${ROUND}"
mkdir -p "$OUT"

# 120 BPM => one beat every 0.5s. 44 beats across 22s.
BEAT_SECONDS=0.5

echo "==> draft render ($COMP) at half scale"
npx remotion render "$COMP" "$OUT/draft.mp4" --scale=0.5 --log=error

echo "==> one frame per beat"
rm -f "$OUT"/beat-*.png
ffmpeg -loglevel error -i "$OUT/draft.mp4" \
  -vf "fps=1/${BEAT_SECONDS},drawtext=text='b%{eif\:n\:d}':x=12:y=12:fontsize=28:fontcolor=yellow:box=1:boxcolor=black@0.7" \
  "$OUT/beat-%02d.png"

echo "==> contact sheet (4 cols)"
ffmpeg -loglevel error -y -pattern_type glob -i "$OUT/beat-*.png" \
  -vf "scale=270:-1,tile=4x11:padding=4:color=#14100d" -frames:v 1 "$OUT/contact.png"

echo "==> readability strip @360px (the phone-size check)"
ffmpeg -loglevel error -y -pattern_type glob -i "$OUT/beat-*.png" \
  -vf "scale=360:-1,tile=4x11:padding=2:color=#14100d" -frames:v 1 "$OUT/readability-360.png"

echo
echo "contact sheet : $OUT/contact.png"
echo "readability   : $OUT/readability-360.png"
echo "draft         : $OUT/draft.mp4"
