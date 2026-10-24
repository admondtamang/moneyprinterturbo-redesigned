#!/usr/bin/env bash
# thecatcourt Film 03 — the READABLE cut. 60 BPM / 60.0s, synthesised entirely in ffmpeg lavfi.
# No samples, no downloads, no licensing. Deterministic (every anoisesrc is seeded).
#
# Grid: 60 BPM -> 1 beat = 1.000s, 60 beats. Beat N lands at N seconds exactly, so every
# moment edge in src/reel/moments.ts (0/6/11/16/24/32/40/44/48/52/56/60) is a beat with no
# arithmetic. Per-accent table: docs/sound-03.md.
#
# THIS IS NOT A RE-TEMPO OF FILMS 01/02. Those are 44-beat showreels — something happened every
# beat and the score was dense and percussive to match. This film has 11 held moments and the
# viewer is READING through each one. So: no hat layer, no quarter-note kick bed, no riser.
# The bed is sustained and quiet; there is exactly ONE accent per moment, on its entrance, and
# the holds between accents are deliberately empty. Movement during a hold reads as urgency.
#
# Narration (~35s of speech) is mixed on top later by the director, so the bed leans on sub and
# air and keeps 200-2000 Hz clear: the pad is lowpassed at 900 Hz, the sheen highpassed at 7 kHz.
#
# Do NOT edit scripts/generate-score.sh, scripts/generate-score-02.sh, or their masters.
set -euo pipefail
cd "$(dirname "$0")/.."

OUT=public/audio/thecatcourt-03.mp3
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
mkdir -p public/audio

F="-hide_banner -loglevel error -y"
SR=44100
BEAT_MS=1000  # 60 BPM. Film 01 used 500, Film 02 used 800.
DUR=60.0      # 60 beats * 1.0s
# Pre-limiter input gain. Same role as in Film 02 but a MUCH smaller number: that cut had 44
# transients over a quiet bed (PLR 18.4, needed 2.2 of drive). This one has 13 soft accents over
# a sustained bed, so the peak-to-loudness ratio is already close to what -14 LUFS / -1 dBFS
# allows and heavy limiting would flatten the one thing the cut depends on — the verdict at 48s
# being visibly the largest hit. Measured: this is the lowest drive whose gate passes.
PRE_GAIN=${PRE_GAIN:-1.00}

# ---------------------------------------------------------------- one-shots
# Absolute envelopes: a click is a click at any tempo. Softened versions of the Film 01/02
# recipes — this film wants marks, not impacts, everywhere except the verdict.

# THUMP — soft low body hit. The default accent: moment entrances in the hook, the charge and
# the verdict follow-through. Dull on purpose: no mid crack, no noise tail in the speech band.
ffmpeg $F \
  -f lavfi -i "sine=f=55:d=0.60:r=$SR" \
  -f lavfi -i "sine=f=110:d=0.60:r=$SR" \
  -f lavfi -i "anoisesrc=d=0.18:c=brown:a=1:r=$SR:s=81" \
  -filter_complex "\
    [0]volume='exp(-t*8)':eval=frame[a];\
    [1]volume='0.30*exp(-t*18)':eval=frame[b];\
    [2]lowpass=f=420,volume='0.34*exp(-t*18)':eval=frame[c];\
    [a][b][c]amix=inputs=3:normalize=0,lowpass=f=1500,volume=1.0dB" \
  -ar $SR -ac 1 "$TMP/thump.wav"

# CLICK — dry wooden mid click: the procedural mark. One of these opens each of the three
# evidence moments, at IDENTICAL level, because the evidence section is the film's spine and
# must feel even rather than escalating.
ffmpeg $F \
  -f lavfi -i "anoisesrc=d=0.070:c=white:a=0.9:r=$SR:s=31" \
  -f lavfi -i "sine=f=180:d=0.090:r=$SR" \
  -filter_complex "\
    [0]bandpass=f=1500:w=1200,volume='exp(-t*150)':eval=frame[a];\
    [1]volume='0.45*exp(-t*70)':eval=frame[b];\
    [a][b]amix=inputs=2:normalize=0,volume=13.5dB" \
  -ar $SR -ac 1 "$TMP/click.wav"

# SWELL — a brief breath of air rising INTO a moment. Band-passed pink noise peaking at 0.80s,
# so delaying by (beat*1000 - 800)ms puts the peak exactly on the beat. The 800ms is absolute
# delay compensation for this file's envelope, not a musical value.
ffmpeg $F -f lavfi -i "anoisesrc=d=1.30:c=pink:a=1:r=$SR:s=41" \
  -af "highpass=f=900,lowpass=f=5200,volume='pow(clip(t/0.80,0,1),2.4)*exp(-max(t-0.80,0)*7)':eval=frame,volume=-13dB" \
  -ar $SR -ac 1 "$TMP/swell.wav"

# SUBHIT — the floor dropping out at 40s. Almost no midrange at all: a deep sine with a long
# decay. It is felt, not heard, which is what "a genuine drop" means when nothing is allowed to
# get busy.
ffmpeg $F \
  -f lavfi -i "sine=f=42:d=1.60:r=$SR" \
  -f lavfi -i "sine=f=84:d=0.80:r=$SR" \
  -filter_complex "\
    [0]volume='exp(-t*3.2)':eval=frame[a];\
    [1]volume='0.22*exp(-t*9)':eval=frame[b];\
    [a][b]amix=inputs=2:normalize=0,lowpass=f=900,volume=3.0dB" \
  -ar $SR -ac 1 "$TMP/subhit.wav"

# STAMP — the gavel. ONE of these in the whole film, at 48.0s on NOT GUILTY. It is the only
# element allowed real transient energy, and the master gate's headroom is spent on it.
ffmpeg $F \
  -f lavfi -i "anoisesrc=d=0.12:c=white:a=1:r=$SR:s=61" \
  -f lavfi -i "anoisesrc=d=0.05:c=white:a=1:r=$SR:s=62" \
  -f lavfi -i "sine=f=70:d=0.70:r=$SR" \
  -f lavfi -i "sine=f=38:d=1.30:r=$SR" \
  -filter_complex "\
    [0]bandpass=f=800:w=1100,volume='exp(-t*55)':eval=frame[a];\
    [1]highpass=f=3000,volume='0.60*exp(-t*150)':eval=frame[b];\
    [2]volume='0.85*exp(-t*10)':eval=frame[c];\
    [3]volume='0.95*exp(-t*5)':eval=frame[d];\
    [a][b][c][d]amix=inputs=4:normalize=0,volume=2.5dB" \
  -ar $SR -ac 1 "$TMP/stamp.wav"

# BELL — the lockup at 56.0s. Warm struck tone (C4 + its fifth + a touch of octave), long decay,
# no noise component. The film ends on a resolving note, not a hit.
ffmpeg $F \
  -f lavfi -i "sine=f=261.63:d=3.0:r=$SR" \
  -f lavfi -i "sine=f=392.00:d=3.0:r=$SR" \
  -f lavfi -i "sine=f=523.25:d=3.0:r=$SR" \
  -f lavfi -i "sine=f=130.81:d=3.0:r=$SR" \
  -filter_complex "\
    [0]volume='0.55*exp(-t*1.5)':eval=frame[a];\
    [1]volume='0.26*exp(-t*2.2)':eval=frame[b];\
    [2]volume='0.12*exp(-t*3.6)':eval=frame[c];\
    [3]volume='0.50*exp(-t*1.1)':eval=frame[d];\
    [a][b][c][d]amix=inputs=4:normalize=0,lowpass=f=4000,afade=t=out:st=2.8:d=0.2,volume=-2.0dB" \
  -ar $SR -ac 1 "$TMP/bell.wav"

# ---------------------------------------------------------------- placement
# ONE accent per moment, on its entrance beat. There is NO percussion bed: no kick pattern, no
# hats, no off-eighths. Between these 13 marks the only thing moving is the drone's 0.10 Hz
# tremolo, which is the "very slow pulse". That emptiness is the cut.
#
#   beat  moment  act                  accent
#    0     m01    hook                 thump
#    6     m02    charge               thump + click
#   11     m03    charge               thump + click
#   16     m04    evidence A           click
#   24     m05    evidence B           click
#   32     m06    evidence C           click
#   40     m07    the number           subhit + swell   (floor drops: bed subtracts here)
#   44     m08    the number           thump (soft)
#   48     m09    VERDICT              stamp + swell + sub/pad slam  <- largest hit in the film
#   52     m10    verdict follow       thump
#   56     m11    lockup               bell
THUMPS="0,6,11,52"
THUMP_SOFT="44"
CLICKS="6,11,16,24,32"
SUBHITS="40"
STAMPS="48"
SWELLS="40,48"
BELLS="56"

# beats csv + offset(ms) -> delay csv in ms. The offset is ABSOLUTE milliseconds (delay
# compensation for a sound whose perceived hit is not at its file start); it never scales.
msl() { awk -v s="$1" -v o="${2:-0}" -v b="$BEAT_MS" 'BEGIN{n=split(s,a,",");for(i=1;i<=n;i++)printf "%s%d",(i>1?",":""),a[i]*b+o}'; }

# stem <input-label> <out-label> <ms csv>  -> graph fragment on stdout
stem() {
  local in=$1 out=$2 g="" mixins="" i n
  local -a ms; IFS=',' read -ra ms <<< "$3"; n=${#ms[@]}
  if [ "$n" -eq 1 ]; then
    printf '[%s]adelay=%s:all=1[%s];' "$in" "${ms[0]}" "$out"; return
  fi
  for ((i=0;i<n;i++)); do g+="[${out}s$i]"; done
  g="[$in]asplit=$n$g;"
  for ((i=0;i<n;i++)); do
    g+="[${out}s$i]adelay=${ms[i]}:all=1[${out}d$i];"
    mixins+="[${out}d$i]"
  done
  printf '%s%samix=inputs=%d:normalize=0:dropout_transition=0[%s];' "$g" "$mixins" "$n" "$out"
}

# ------------------------------------------------------------- section envelopes
# Every anchor is a moment edge from src/reel/moments.ts. Ramps are 0.12-0.25s: long enough not
# to click, short enough that the change is heard AS the accent rather than after it.
#
# SUB — the 65 Hz drone. Quiet and open for the hook, a little more body through the charge,
# then FLAT across all three evidence moments (16-40s). The evidence section deliberately does
# not build: it is procedure, not suspense. At 40s it subtracts hard (the number drops in on an
# emptier floor), at 48s it slams back for the verdict, then resolves away to silence.
SUB_ENV="0.26\
 +0.11*clip((t-6.0)/0.25,0,1)\
 +0.05*clip((t-11.0)/0.25,0,1)\
 +0.04*clip((t-16.0)/0.25,0,1)\
 -0.21*clip((t-39.88)/0.12,0,1)\
 +0.05*clip((t-44.0)/0.25,0,1)\
 +0.34*clip((t-47.90)/0.10,0,1)\
 -0.24*clip((t-52.0)/0.25,0,1)\
 -0.20*clip((t-56.0)/0.40,0,1)\
 -0.44*clip((t-57.6)/2.20,0,1)"
# PAD — a warm C-minor-ish triad, LOWPASSED AT 900 Hz. This is the one thing most likely to
# mask the narrator, so it is a floor colour and never a voice: it sits under the speech band
# rather than inside it, and it thins out (not up) under the two number moments where the
# narration is carrying the only hard figure in the film.
PAD_ENV="0.06\
 +0.07*clip((t-6.0)/0.40,0,1)\
 +0.04*clip((t-11.0)/0.40,0,1)\
 +0.03*clip((t-16.0)/0.40,0,1)\
 -0.13*clip((t-39.88)/0.20,0,1)\
 +0.31*clip((t-47.90)/0.15,0,1)\
 -0.14*clip((t-52.0)/0.40,0,1)\
 -0.12*clip((t-56.0)/0.60,0,1)\
 -0.18*clip((t-57.6)/2.20,0,1)"
# AIR — band-limited noise (3.4-12 kHz): room tone / paper texture. It sits ABOVE the 200-2000 Hz
# band the narrator needs, and because K-weighting favours 3-10 kHz it is the cheapest loudness in
# the mix per dB of peak — which is the only reason a bed this sparse can be delivered at -14 LUFS
# at all. Its arc is SUBORDINATE to the sub/pad arc: a first pass had the air brightest in the hook,
# which made the hook the second-loudest act in the film and inverted the intended shape. It is now
# near-flat from 0-40s and only moves for the number drop and the verdict.
AIR_ENV="0.13\
 +0.030*clip((t-6.0)/0.40,0,1)\
 -0.010*clip((t-16.0)/0.40,0,1)\
 -0.045*clip((t-39.88)/0.20,0,1)\
 +0.200*clip((t-47.90)/0.15,0,1)\
 -0.105*clip((t-52.0)/0.40,0,1)\
 -0.165*clip((t-56.0)/1.60,0,1)"

GRAPH="\
[0]tremolo=f=0.10:d=0.22,volume='${SUB_ENV// /}':eval=frame[sub];\
[1]tremolo=f=0.13:d=0.18,volume='(${SUB_ENV// /})*0.34':eval=frame[sub2];\
[2]tremolo=f=0.12:d=0.26,volume='(${PAD_ENV// /})*0.55':eval=frame[p1];\
[3]tremolo=f=0.15:d=0.30,volume='(${PAD_ENV// /})*0.38':eval=frame[p2];\
[4]tremolo=f=0.17:d=0.24,volume='(${PAD_ENV// /})*0.26':eval=frame[p3];\
[5]tremolo=f=0.19:d=0.28,volume='(${PAD_ENV// /})*0.15':eval=frame[p4];\
[p1][p2][p3][p4]amix=inputs=4:normalize=0[pad];\
[6]highpass=f=3400,lowpass=f=12000,volume='(${AIR_ENV// /})*0.30':eval=frame[air];\
$(stem 7  thumps  "$(msl "$THUMPS")")\
$(stem 8  thumpsf "$(msl "$THUMP_SOFT")")\
$(stem 9  clicks  "$(msl "$CLICKS")")\
$(stem 10 subhits "$(msl "$SUBHITS")")\
$(stem 11 stamps  "$(msl "$STAMPS")")\
$(stem 12 swells  "$(msl "$SWELLS" -800)")\
$(stem 13 bells   "$(msl "$BELLS")")\
[sub][sub2][pad][air][thumps][thumpsf][clicks][subhits][stamps][swells][bells]\
amix=inputs=11:normalize=0:dropout_transition=0:weights='0.55 0.20 1.80 7.80 0.30 0.18 0.20 0.36 0.60 0.40 0.45',\
alimiter=level_in=${PRE_GAIN}:limit=0.891:level=disabled,\
afade=t=out:st=59.70:d=0.30,\
apad,atrim=0:${DUR}[mix]"

ffmpeg $F \
  -f lavfi -i "sine=f=65.41:d=$DUR:r=$SR" \
  -f lavfi -i "sine=f=98.00:d=$DUR:r=$SR" \
  -f lavfi -i "sine=f=130.81:d=$DUR:r=$SR" \
  -f lavfi -i "sine=f=155.56:d=$DUR:r=$SR" \
  -f lavfi -i "sine=f=196.00:d=$DUR:r=$SR" \
  -f lavfi -i "sine=f=233.08:d=$DUR:r=$SR" \
  -f lavfi -i "anoisesrc=d=$DUR:c=white:a=1:r=$SR:s=7" \
  -i "$TMP/thump.wav" -i "$TMP/thump.wav" -i "$TMP/click.wav" \
  -i "$TMP/subhit.wav" -i "$TMP/stamp.wav" -i "$TMP/swell.wav" \
  -i "$TMP/bell.wav" \
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

# ---------------------------------------------------------------- master gate
# The spec is -14 LUFS +/-0.5, true peak <= -1.0 dBFS, 60.000s (NOT 22.0 or 35.2 — this is the
# readable cut). Executable, not a comment: the next person who adds a hit gets a failure rather
# than an out-of-spec master.
EB="$(ffmpeg -hide_banner -nostats -i "$OUT" -af ebur128=peak=true -f null - 2>&1)"
GOT_I="$(printf '%s' "$EB"  | sed -n 's/.*I: *\(-\?[0-9.]*\) LUFS.*/\1/p'  | tail -1)"
GOT_TP="$(printf '%s' "$EB" | sed -n 's/.*Peak: *\(-\?[0-9.]*\) dBFS.*/\1/p' | tail -1)"
GOT_D="$(ffprobe -v error -show_entries format=duration -of default=nk=1:nw=1 "$OUT")"

fail=0
awk -v v="$GOT_I"  'BEGIN{exit !(v>=-14.5 && v<=-13.5)}' || { echo "FAIL loudness $GOT_I LUFS (want -14.0 +/-0.5)"; fail=1; }
awk -v v="$GOT_TP" 'BEGIN{exit !(v<=-1.0)}'              || { echo "FAIL true peak $GOT_TP dBFS (want <= -1.0)"; fail=1; }
awk -v v="$GOT_D"  'BEGIN{exit !(v>=59.95 && v<=60.05)}' || { echo "FAIL duration $GOT_D s (want 60.000)"; fail=1; }

# The verdict at 48.0s must be the loudest single transient in the film. If a later edit makes
# any other accent bigger, the film's shape is broken even though the loudness spec still passes.
peak_at() { ffmpeg -hide_banner -nostats -ss "$1" -t 0.5 -i "$OUT" -af astats=metadata=1 -f null - 2>&1 \
  | sed -n 's/.*Peak level dB: *\(-\?[0-9.]*\).*/\1/p' | sort -g | tail -1; }
V_PEAK="$(peak_at 48.0)"
for b in 0 6 11 16 24 32 40 44 52 56; do
  O_PEAK="$(peak_at "$b")"
  awk -v v="$V_PEAK" -v o="$O_PEAK" 'BEGIN{exit !(v>o+0.5)}' \
    || { echo "FAIL accent at ${b}s (${O_PEAK} dB) is not clearly below the 48s verdict (${V_PEAK} dB)"; fail=1; }
done

[ "$fail" -eq 0 ] || { echo "master is OUT OF SPEC — not fit to ship"; exit 1; }
echo "master OK: I=${GOT_I} LUFS  TP=${GOT_TP} dBFS  dur=${GOT_D}s  verdict peak=${V_PEAK} dB"
