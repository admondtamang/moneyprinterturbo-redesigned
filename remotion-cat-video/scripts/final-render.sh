#!/usr/bin/env bash
# Full-quality deliverable render. Only run once every critique axis scores 8+.
# Produces: out/<name>.mp4, out/poster.png, out/contact.png, out/loop_check.png
set -euo pipefail
cd "$(dirname "$0")/.."

COMP="${1:-TheCatCourt01}"
NAME="${2:-thecatcourt-01}"
TOTAL=1320

echo "==> typecheck"
npx tsc --noEmit

echo "==> full render (CRF 16, H.264 yuv420p)"
npx remotion render "$COMP" "out/${NAME}.mp4" --crf=16 --pixel-format=yuv420p --log=error

echo "==> poster frame (hook fully landed; frame 96 — earlier frames catch the type mid-slam and clip it)"
npx remotion still "$COMP" out/poster.png --frame=96 --log=error

echo "==> contact sheet of the deliverable"
mkdir -p out/_final_beats
rm -f out/_final_beats/b-*.png
ffmpeg -loglevel error -i "out/${NAME}.mp4" -vf "fps=2" out/_final_beats/b-%02d.png
ffmpeg -loglevel error -y -pattern_type glob -i "out/_final_beats/b-*.png" \
  -vf "scale=270:-1,tile=4x11:padding=4:color=#14100d" -frames:v 1 out/contact.png

echo "==> loop check: first frame vs last frame"
# Seeking the final frame with ffmpeg -ss is unreliable at the very end of a file, so render
# both endpoints from the composition itself. The paw is in motion at the loop point, so it
# MUST differ by exactly one frame of travel; everything else must match.
npx remotion still "$COMP" out/_loop_first.png --frame=0 --log=error
npx remotion still "$COMP" out/_loop_last.png --frame=$(( TOTAL - 1 )) --log=error
ffmpeg -loglevel error -y -i out/_loop_first.png -i out/_loop_last.png \
  -filter_complex "[0][1]hstack" out/loop_check.png
ffmpeg -loglevel error -y -i out/_loop_first.png -i out/_loop_last.png \
  -filter_complex "[0][1]blend=all_mode=difference,format=gray" out/_loop_diff.png
# Everything left of the paw's travel lane must be pixel-identical.
STATIC=$(ffmpeg -loglevel error -i out/_loop_diff.png -vf "crop=690:1920:0:0" \
  -f rawvideo -pix_fmt gray - | od -An -tu1 -v \
  | awk '{for(i=1;i<=NF;i++){t++; if($i>12)k++}} END{print k+0}')
echo "  static-region differing px: ${STATIC} (sub-pixel AA only; structural mismatch would be thousands)"

echo
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/${NAME}.mp4")
echo "duration : ${DUR}s"
ffprobe -v error -show_entries stream=width,height,r_frame_rate,codec_name -of default=nw=1 "out/${NAME}.mp4" | head -8
echo
echo "deliverable : out/${NAME}.mp4   poster: out/poster.png"
echo "contact     : out/contact.png   loop:   out/loop_check.png (left=first, right=last; must match)"
