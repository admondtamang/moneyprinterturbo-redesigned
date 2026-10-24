#!/usr/bin/env bash
# thecatcourt Film 01 — score + SFX, synthesised entirely in ffmpeg lavfi.
# No samples, no downloads, no licensing. Deterministic (every anoisesrc is seeded).
#
# Grid: 120 BPM -> 1 beat = 0.5s, 1 bar = 2.0s, 11 bars = 44 beats = 22.0s exactly.
# Beat N lands at N*0.5s. SFX placement is driven by the SFX column of docs/shotlist.md;
# the per-event table lives in docs/sound.md.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=public/audio/thecatcourt-01.mp3
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p public/audio

F="-hide_banner -loglevel error -y"
SR=44100
# Pre-limiter input gain. The mix is extremely peaky (slam/stamp over a quiet bed), so a
# straight linear loudnorm to -14 LUFS would need ~+10dB and blow the true peak. Driving the
# limiter instead squashes the peak-to-loudness ratio into the ~11dB budget that -14 LUFS /
# -1 dBFS allows, which is what makes the second pass able to stay linear.
PRE_GAIN=${PRE_GAIN:-1.0}

# ---------------------------------------------------------------- one-shots
# KICK — the spine. Two decaying sines (50/100 Hz) + a tiny high transient.
ffmpeg $F \
  -f lavfi -i "sine=f=50:d=0.30:r=$SR" \
  -f lavfi -i "sine=f=100:d=0.30:r=$SR" \
  -f lavfi -i "anoisesrc=d=0.30:c=white:a=0.8:r=$SR:s=11" \
  -filter_complex "\
    [0]volume='exp(-t*9)':eval=frame[a];\
    [1]volume='0.55*exp(-t*20)':eval=frame[b];\
    [2]highpass=f=1600,volume='0.22*exp(-t*170)':eval=frame[c];\
    [a][b][c]amix=inputs=3:normalize=0,lowpass=f=6500,volume=4.3dB" \
  -ar $SR -ac 1 "$TMP/kick.wav"

# TICK — dry procedural click (very short high-passed noise). Used twice: as the quiet
# off-eighth hat layer of the bed, and louder as the shotlist's "tick" SFX.
ffmpeg $F -f lavfi -i "anoisesrc=d=0.030:c=white:a=0.9:r=$SR:s=21" \
  -af "highpass=f=4200,volume='exp(-t*380)':eval=frame,volume=-14dB" \
  -ar $SR -ac 1 "$TMP/tick.wav"

# CLICK — mechanical mid click, the case-file / counter sound.
ffmpeg $F \
  -f lavfi -i "anoisesrc=d=0.070:c=white:a=0.9:r=$SR:s=31" \
  -f lavfi -i "sine=f=180:d=0.070:r=$SR" \
  -filter_complex "\
    [0]bandpass=f=1600:w=1400,volume='exp(-t*130)':eval=frame[a];\
    [1]volume='0.35*exp(-t*90)':eval=frame[b];\
    [a][b]amix=inputs=2:normalize=0,volume=16.8dB" \
  -ar $SR -ac 1 "$TMP/click.wav"

# WHOOSH — exhibit transition. Band-passed pink noise swelling to a peak at 0.40s,
# so delaying by (beat*500 - 400)ms puts the peak exactly on the beat.
ffmpeg $F -f lavfi -i "anoisesrc=d=0.70:c=pink:a=1:r=$SR:s=41" \
  -af "highpass=f=600,lowpass=f=6000,volume='pow(clip(t/0.40,0,1),2.2)*exp(-max(t-0.40,0)*16)':eval=frame,volume=-9dB" \
  -ar $SR -ac 1 "$TMP/whoosh.wav"

# SLAM — the type-impact. Nine of them: the three hook words, the gavel, and every claim/verdict.
ffmpeg $F \
  -f lavfi -i "sine=f=45:d=0.90:r=$SR" \
  -f lavfi -i "sine=f=90:d=0.90:r=$SR" \
  -f lavfi -i "anoisesrc=d=0.40:c=brown:a=1:r=$SR:s=51" \
  -f lavfi -i "anoisesrc=d=0.09:c=white:a=1:r=$SR:s=52" \
  -filter_complex "\
    [0]volume='exp(-t*7)':eval=frame[a];\
    [1]volume='0.40*exp(-t*16)':eval=frame[b];\
    [2]lowpass=f=400,volume='0.55*exp(-t*12)':eval=frame[c];\
    [3]bandpass=f=900:w=800,volume='0.45*exp(-t*55)':eval=frame[d];\
    [a][b][c][d]amix=inputs=4:normalize=0,volume=7.1dB" \
  -ar $SR -ac 1 "$TMP/slam.wav"

# STAMP — wooden mid crack + sub boom. Beats 11 and 28 use it at nominal level; beat 35
# (the verdict stamp, the loudest single hit in the film) gets its own louder stem.
ffmpeg $F \
  -f lavfi -i "anoisesrc=d=0.12:c=white:a=1:r=$SR:s=61" \
  -f lavfi -i "anoisesrc=d=0.05:c=white:a=1:r=$SR:s=62" \
  -f lavfi -i "sine=f=70:d=0.60:r=$SR" \
  -f lavfi -i "sine=f=38:d=1.00:r=$SR" \
  -filter_complex "\
    [0]bandpass=f=800:w=1100,volume='exp(-t*55)':eval=frame[a];\
    [1]highpass=f=3000,volume='0.60*exp(-t*150)':eval=frame[b];\
    [2]volume='0.80*exp(-t*12)':eval=frame[c];\
    [3]volume='0.90*exp(-t*6)':eval=frame[d];\
    [a][b][c][d]amix=inputs=4:normalize=0" \
  -ar $SR -ac 1 "$TMP/stamp.wav"

# THUMP — soft low body hit: paw-on-mug (beat 0), panel flex (9), paw landing on a
# station (18), verdict block docking (39). Deliberately softer and duller than SLAM:
# no mid crack, no brown-noise tail, ~5dB less drive.
ffmpeg $F \
  -f lavfi -i "sine=f=55:d=0.50:r=$SR" \
  -f lavfi -i "sine=f=110:d=0.50:r=$SR" \
  -f lavfi -i "anoisesrc=d=0.15:c=brown:a=1:r=$SR:s=81" \
  -filter_complex "\
    [0]volume='exp(-t*11)':eval=frame[a];\
    [1]volume='0.32*exp(-t*22)':eval=frame[b];\
    [2]lowpass=f=500,volume='0.40*exp(-t*20)':eval=frame[c];\
    [a][b][c]amix=inputs=3:normalize=0,lowpass=f=1800,volume=2.0dB" \
  -ar $SR -ac 1 "$TMP/thump.wav"

# DROP — beat 22 only: the object falling out of the box along the predicted arc.
# Exponential downward glide 300->~90 Hz over 0.4s, then the landing at 0.40s, so
# delaying by (beat*500 - 400)ms puts the LANDING on the beat (same trick as WHOOSH).
ffmpeg $F \
  -f lavfi -i "aevalsrc=sin(2*PI*100*(1-exp(-3*t))):d=0.42:s=$SR" \
  -f lavfi -i "sine=f=58:d=0.50:r=$SR" \
  -f lavfi -i "anoisesrc=d=0.06:c=white:a=1:r=$SR:s=91" \
  -filter_complex "\
    [0]lowpass=f=6000,volume='0.75*pow(clip(t/0.08,0,1),1.5)*exp(-t*1.2)':eval=frame[a];\
    [1]volume='0.95*exp(-t*15)':eval=frame,adelay=400:all=1[b];\
    [2]bandpass=f=1200:w=900,volume='0.45*exp(-t*90)':eval=frame,adelay=400:all=1[c];\
    [a][b][c]amix=inputs=3:normalize=0,volume=1.5dB" \
  -ar $SR -ac 1 "$TMP/drop.wav"

# RISER — 1.5s build peaking exactly at its end: pink-noise crescendo plus the C minor
# triad stacking in one note at a time. Delayed by (beat*500 - 1000)ms so the peak lands
# one beat AFTER the shotlist beat — i.e. it builds under beat 14 and resolves on the
# beat-15 claim slam, and builds under beat 31 and resolves on the beat-32 verdict wipe.
ffmpeg $F \
  -f lavfi -i "anoisesrc=d=1.5:c=pink:a=1:r=$SR:s=71" \
  -f lavfi -i "sine=f=130.81:d=1.5:r=$SR" \
  -f lavfi -i "sine=f=155.56:d=1.5:r=$SR" \
  -f lavfi -i "sine=f=196.00:d=1.5:r=$SR" \
  -filter_complex "\
    [0]highpass=f=500,lowpass=f=7000,volume='0.90*pow(t/1.5,2.2)':eval=frame[a];\
    [1]tremolo=f=6:d=0.4,volume='0.80*pow(t/1.5,2)':eval=frame[b];\
    [2]tremolo=f=6:d=0.4,volume='0.65*between(t,0.5,1.5)*pow(clip((t-0.5)/1.0,0,1),2)':eval=frame[c];\
    [3]tremolo=f=6:d=0.4,volume='0.55*between(t,1.0,1.5)*pow(clip((t-1.0)/0.5,0,1),2)':eval=frame[d];\
    [a][b][c][d]amix=inputs=4:normalize=0,afade=t=out:st=1.45:d=0.05" \
  -ar $SR -ac 1 "$TMP/riser.wav"

# ---------------------------------------------------------------- placement
# Musical bed: the kick layers are the pulse, HATS the off-eighth texture. These are NOT
# shotlist events and are intentionally independent of the SFX layer below.
K_SOFT="0,2,40,42,43.5"                                             # bar 0 + bar 10
K_MID="4,6,8,10,12,13,14,15,16,17,18,19,20,21,21.5,22,22.5,23,23.5" # bars 1-5
K_HARD="32,33,34,35,35.5,36,37,38,39,39.5"                          # bars 8-9
HATS="4.5,5.5,6.5,7.5,8.5,9.5,10.5,11.5,12.5,13.5,14.5,15.5,16.5,17.5,18.5,19.5,20.5,21.5,22.5,23.5,24.5,25.5,26.5,27.5,28.5,29.5,30.5,31.25,31.5,31.75,40.5,41,41.5,42.5"

# SFX layer — one entry per row of the shotlist beat table (44 beats, beat 43 is silent).
THUMPS="0,9,18,39"
SLAMS="1,2,3,12,15,19,23,33,34"
WHOOSH="4,7,13,25,30,32,42"
CLICKS="5,10,16,20,29,37,40"
TICKS="6,8,17,21,26,27,36,38,41"
STAMPS="11,28"                   # beat 35 is the verdict stamp, below
STAMP_BIG="35"                   # loudest single hit in the film
DROPS="22"                       # beat 24's "drop" is the score leaving: see SUB_ENV/PAD_ENV
RISERS="14,31"

# beats csv + offset(ms) -> delay csv in ms
msl() { awk -v s="$1" -v o="${2:-0}" 'BEGIN{n=split(s,a,",");for(i=1;i<=n;i++)printf "%s%d",(i>1?",":""),a[i]*500+o}'; }

# stem <input-label> <out-label> <ms csv>  -> graph fragment on stdout
stem() {
  local in=$1 out=$2 g="" mixins="" i n
  local -a ms; IFS=',' read -ra ms <<< "$3"; n=${#ms[@]}
  for ((i=0;i<n;i++)); do g+="[${out}s$i]"; done
  g="[$in]asplit=$n$g;"
  for ((i=0;i<n;i++)); do
    g+="[${out}s$i]adelay=${ms[i]}:all=1[${out}d$i];"
    mixins+="[${out}d$i]"
  done
  printf '%s%samix=inputs=%d:normalize=0:dropout_transition=0[%s];' "$g" "$mixins" "$n" "$out"
}

# Section envelopes, evaluated per frame. 50-200ms ramps so steps never click.
# Drone: creeps in over bars 0-5, cut to silence at 12.0s (beat 24 — the floor drops and
# the deliberation starts dry), slams back at 16.0s (beat 32, the verdict), resolves
# through bar 10, decays into the loop point. THIS is the beat-24 "drop": a subtraction.
SUB_ENV="0.30\
 +0.18*clip((t-2.0)/0.1,0,1)\
 +0.14*clip((t-6.0)/0.1,0,1)\
 -0.62*clip((t-11.9)/0.1,0,1)\
 +0.85*clip((t-15.95)/0.05,0,1)\
 -0.35*clip((t-19.95)/0.05,0,1)\
 -0.50*clip((t-21.6)/0.4,0,1)"
# Pad (C minor triad): absent in bar 0, whispers in 1-2, grows 3-5, gone 6-7,
# full in 8-9, resolves in 10.
PAD_ENV="0.10*clip((t-2.0)/0.2,0,1)\
 +0.10*clip((t-6.0)/0.2,0,1)\
 +0.08*clip((t-8.0)/0.2,0,1)\
 +0.06*clip((t-10.0)/0.2,0,1)\
 -0.34*clip((t-11.9)/0.1,0,1)\
 +0.40*clip((t-15.95)/0.15,0,1)\
 -0.15*clip((t-20.0)/0.2,0,1)\
 -0.25*clip((t-21.5)/0.5,0,1)"

GRAPH="\
[0]volume='${SUB_ENV// /}':eval=frame,lowpass=f=160[sub];\
[1]tremolo=f=0.25:d=0.25,volume='(${PAD_ENV// /})*1.80':eval=frame[p1];\
[2]tremolo=f=0.19:d=0.30,volume='(${PAD_ENV// /})*1.26':eval=frame[p2];\
[3]tremolo=f=0.31:d=0.22,volume='(${PAD_ENV// /})*0.99':eval=frame[p3];\
[13]tremolo=f=0.23:d=0.28,volume='(${PAD_ENV// /})*0.90':eval=frame[p4];\
[14]tremolo=f=0.17:d=0.33,volume='(${PAD_ENV// /})*0.63':eval=frame[p5];\
[15]tremolo=f=0.29:d=0.26,volume='(${PAD_ENV// /})*0.50':eval=frame[p6];\
[p1][p2][p3][p4][p5][p6]amix=inputs=6:normalize=0,lowpass=f=5000[pad];\
$(stem 4  ksoft  "$(msl "$K_SOFT")")\
$(stem 5  kmid   "$(msl "$K_MID")")\
$(stem 6  khard  "$(msl "$K_HARD")")\
$(stem 7  hats   "$(msl "$HATS")")\
$(stem 16 ticks  "$(msl "$TICKS")")\
$(stem 8  clicks "$(msl "$CLICKS")")\
$(stem 9  whsh   "$(msl "$WHOOSH" -400)")\
$(stem 10 slams  "$(msl "$SLAMS")")\
$(stem 11 stamps "$(msl "$STAMPS")")\
$(stem 17 stampb "$(msl "$STAMP_BIG")")\
$(stem 12 risers "$(msl "$RISERS" -1000)")\
$(stem 18 thumps "$(msl "$THUMPS")")\
$(stem 19 drops  "$(msl "$DROPS" -400)")\
[sub][pad][ksoft][kmid][khard][hats][ticks][clicks][whsh][slams][stamps][stampb][risers][thumps][drops]\
amix=inputs=15:normalize=0:dropout_transition=0:weights='1.0 1.0 0.55 0.80 1.00 0.35 0.60 0.50 0.50 0.90 0.95 1.25 1.10 0.75 1.05',\
alimiter=level_in=${PRE_GAIN}:limit=0.891:level=disabled,\
afade=t=out:st=21.85:d=0.15,\
apad,atrim=0:22[mix]"

ffmpeg $F \
  -f lavfi -i "sine=f=65.41:d=22:r=$SR" \
  -f lavfi -i "sine=f=130.81:d=22:r=$SR" \
  -f lavfi -i "sine=f=155.56:d=22:r=$SR" \
  -f lavfi -i "sine=f=196.00:d=22:r=$SR" \
  -i "$TMP/kick.wav" -i "$TMP/kick.wav" -i "$TMP/kick.wav" \
  -i "$TMP/tick.wav" -i "$TMP/click.wav" -i "$TMP/whoosh.wav" \
  -i "$TMP/slam.wav" -i "$TMP/stamp.wav" -i "$TMP/riser.wav" \
  -f lavfi -i "sine=f=261.63:d=22:r=$SR" \
  -f lavfi -i "sine=f=311.13:d=22:r=$SR" \
  -f lavfi -i "sine=f=392.00:d=22:r=$SR" \
  -i "$TMP/tick.wav" -i "$TMP/stamp.wav" \
  -i "$TMP/thump.wav" -i "$TMP/drop.wav" \
  -filter_complex "$GRAPH" -map "[mix]" \
  -ar $SR -ac 2 -c:a pcm_s16le "$TMP/mix.wav"

# ------------------------------------------------- two-pass loudnorm to -14 LUFS
# TP target is -2.6, not -1.0: the mp3 encoder overshoots the PCM true peak by ~1dB and the
# residual trim below adds another ~0.7dB; the delivered file has to sit at or below -1.0 dBFS.
LN="I=-14:TP=-2.6:LRA=11"
MEASURED="$(ffmpeg -hide_banner -nostats -i "$TMP/mix.wav" \
  -af "loudnorm=${LN}:print_format=json" -f null - 2>&1 | sed -n '/{/,/}/p')"

val() { printf '%s' "$MEASURED" | sed -n "s/.*\"$1\"[[:space:]]*:[[:space:]]*\"\([^\"]*\)\".*/\1/p"; }
M_I="$(val input_i)"; M_TP="$(val input_tp)"; M_LRA="$(val input_lra)"
M_THRESH="$(val input_thresh)"; M_OFFSET="$(val target_offset)"
[ -n "$M_I" ] && [ -n "$M_TP" ] && [ -n "$M_THRESH" ] || { echo "loudnorm pass 1 parse failed:"; echo "$MEASURED"; exit 1; }
echo "pass1: I=$M_I TP=$M_TP LRA=$M_LRA thresh=$M_THRESH offset=$M_OFFSET"
awk -v i="$M_I" -v tp="$M_TP" 'BEGIN{printf "pass1: PLR=%.2f dB (needs <=11.4 for a linear -14 LUFS / -2.6 dBTP pass)\n", tp-i}'

ffmpeg $F -i "$TMP/mix.wav" \
  -af "loudnorm=${LN}:measured_I=${M_I}:measured_TP=${M_TP}:measured_LRA=${M_LRA}:measured_thresh=${M_THRESH}:offset=${M_OFFSET}:linear=true" \
  -ar $SR -ac 2 -c:a pcm_s16le "$TMP/norm.wav"

# loudnorm's gain comes from the pass-1 estimate, and libmp3lame shifts integrated loudness by
# another ~0.4 LU on top. Both are measured, not guessed: encode once, measure the DELIVERED mp3,
# then re-encode from the normalised PCM with the residual folded in (still one lossy generation).
# There is >2dB of true-peak headroom, so the trim cannot push TP past -1.0 dBFS.
measure_i() {
  ffmpeg -hide_banner -nostats -i "$1" -af "loudnorm=${LN}:print_format=json" -f null - 2>&1 \
    | sed -n '/{/,/}/p' | sed -n 's/.*"input_i"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p'
}

ffmpeg $F -i "$TMP/norm.wav" -ar $SR -ac 2 -c:a libmp3lame -b:a 192k "$TMP/probe.mp3"
PROBE_I="$(measure_i "$TMP/probe.mp3")"
[ -n "$PROBE_I" ] || { echo "residual measurement failed"; exit 1; }
TRIM="$(awk -v i="$PROBE_I" 'BEGIN{printf "%.2f", -14.0-i}')"
echo "pass2: delivered-format probe I=$PROBE_I -> residual trim ${TRIM}dB"

ffmpeg $F -i "$TMP/norm.wav" -af "volume=${TRIM}dB" \
  -ar $SR -ac 2 -c:a libmp3lame -b:a 192k "$OUT"

echo "generated $OUT"
ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT"

# ---------------------------------------------------------------- master gate
# The spec is -14 LUFS +/-0.5 and true peak <= -1.0 dBFS at 22.000s. This used to be a COMMENT
# asserting there was enough headroom; that assertion silently became false when the SFX count
# grew from ~30 to 44 hits and the residual trim grew with it. Make it executable instead, so
# the next person who adds a hit gets a failure rather than an out-of-spec master.
EB="$(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1)"
GOT_I="$(printf '%s' "$EB"  | sed -n 's/.*I: *\(-\?[0-9.]*\) LUFS.*/\1/p'  | tail -1)"
GOT_TP="$(printf '%s' "$EB" | sed -n 's/.*Peak: *\(-\?[0-9.]*\) dBFS.*/\1/p' | tail -1)"
GOT_D="$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT")"

fail=0
awk -v v="$GOT_I"  'BEGIN{exit !(v>=-14.5 && v<=-13.5)}' || { echo "FAIL loudness $GOT_I LUFS (want -14.0 +/-0.5)"; fail=1; }
awk -v v="$GOT_TP" 'BEGIN{exit !(v<=-1.0)}'              || { echo "FAIL true peak $GOT_TP dBFS (want <= -1.0)"; fail=1; }
awk -v v="$GOT_D"  'BEGIN{exit !(v>=21.95 && v<=22.05)}' || { echo "FAIL duration $GOT_D s (want 22.000)"; fail=1; }
[ "$fail" -eq 0 ] || { echo "master is OUT OF SPEC — not fit to ship"; exit 1; }
echo "master OK: I=${GOT_I} LUFS  TP=${GOT_TP} dBFS  dur=${GOT_D}s"
