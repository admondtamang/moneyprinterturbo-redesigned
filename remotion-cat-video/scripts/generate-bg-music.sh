#!/usr/bin/env bash
# Synthesizes a soft, seamless-loop ambient pad (no external samples/licensing).
set -euo pipefail
cd "$(dirname "$0")/.."

ffmpeg -y \
  -f lavfi -i "sine=frequency=130.81:duration=16" \
  -f lavfi -i "sine=frequency=261.63:duration=16" \
  -f lavfi -i "sine=frequency=329.63:duration=16" \
  -f lavfi -i "sine=frequency=392.00:duration=16" \
  -filter_complex "\
    [0]tremolo=f=0.10:d=0.5,volume=0.22[bass];\
    [1]tremolo=f=0.15:d=0.4,volume=0.16[root];\
    [2]tremolo=f=0.12:d=0.35,volume=0.13[third];\
    [3]tremolo=f=0.18:d=0.3,volume=0.11[fifth];\
    [bass][root][third][fifth]amix=inputs=4:duration=longest:dropout_transition=0,\
    lowpass=f=3200,\
    afade=t=in:st=0:d=2,\
    afade=t=out:st=14:d=2\
  " \
  -ar 44100 -ac 2 public/audio/background.mp3

echo "generated public/audio/background.mp3"
