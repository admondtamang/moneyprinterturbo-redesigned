"""Re-chunk word-level timing into short, studio-style caption phrases.

Both TTS providers with real word timing (edge-tts ``WordBoundary`` cues,
Whisper ``word_timestamps=True``) and providers without it (ElevenLabs,
Chatterbox, ...) need to end up as short on-screen phrases instead of one
subtitle entry per full sentence. This module is the single place that turns
a stream of timed words into caption-sized chunks, so both TTS paths
(``app/services/voice.py`` and ``app/services/subtitle.py``) share the same
segmentation rules instead of drifting apart.
"""

from __future__ import annotations

from collections import namedtuple

MAX_CHUNK_WORDS = 4
MAX_CHUNK_CHARS = 22
MIN_CHUNK_DURATION = 0.5

Word = namedtuple("Word", ["text", "start", "end"])

# Punctuation that ends a clause/sentence in either Latin or CJK scripts —
# a natural place to break a caption even before the word/char cap is hit.
_BREAK_PUNCTUATION = set(".!?;:,。！？；：、，")

# Common English conjunctions: breaking *before* one of these (so it leads
# the next chunk) reads more naturally than breaking mid-clause.
_LEADING_CONJUNCTIONS = {"and", "but", "or", "so", "because", "which", "that"}

# Scripts that don't use spaces between words. Chunking these by word count
# is meaningless, so they're segmented purely by character count instead.
_NO_SPACE_RANGES = (
    (0x4E00, 0x9FFF),  # CJK Unified Ideographs
    (0x3400, 0x4DBF),  # CJK Extension A
    (0x3040, 0x30FF),  # Hiragana / Katakana
    (0xAC00, 0xD7A3),  # Hangul syllables
    (0x0E00, 0x0E7F),  # Thai
    (0x0E80, 0x0EFF),  # Lao
    (0x1000, 0x109F),  # Myanmar
    (0x1780, 0x17FF),  # Khmer
)


def _is_no_space_char(ch: str) -> bool:
    code = ord(ch)
    return any(lo <= code <= hi for lo, hi in _NO_SPACE_RANGES)


def is_no_space_language(text: str) -> bool:
    """True if *text* is written in a script with no spaces between words."""
    letters = [ch for ch in text if ch.isalnum()]
    if not letters:
        return False
    no_space_count = sum(1 for ch in letters if _is_no_space_char(ch))
    return (no_space_count / len(letters)) > 0.3


def distribute_proportionally(text: str, start: float, end: float) -> list[Word]:
    """Synthesize per-word timing when only sentence-level timing exists.

    Splits *text* into words (or characters, for no-space scripts) and
    spreads ``[start, end]`` across them proportionally to character count.
    Used as the fallback for TTS providers/paths that only return one
    start/end pair for a whole sentence.
    """
    text = text.strip()
    if not text:
        return []

    no_space = is_no_space_language(text)
    tokens = list(text) if no_space else [t for t in text.split(" ") if t]
    if not tokens:
        return []

    duration = max(0.0, end - start)
    # Weight each token by its character count, plus one for the space that
    # follows it (space-delimited languages only) so token duration roughly
    # tracks reading time rather than raw glyph count.
    weights = [len(t) + (0 if no_space else 1) for t in tokens]
    total_weight = sum(weights) or 1

    words = []
    cursor = start
    for token, weight in zip(tokens, weights):
        token_duration = duration * (weight / total_weight)
        token_end = cursor + token_duration
        words.append(Word(token, cursor, token_end))
        cursor = token_end

    # Force the last word to end exactly on `end` to avoid float drift.
    if words:
        last = words[-1]
        words[-1] = Word(last.text, last.start, end)
    return words


def resolve_chunk_words(raw_words: list[Word], verified_text: str) -> list[Word]:
    """Reconcile real per-word cue timing with script-verified text.

    Raw TTS word cues occasionally don't line up with the actual script
    text (letter-form normalization, stripped spacing/punctuation, or a
    whole sentence delivered as a single cue) — callers typically already
    ran fuzzy matching (e.g. edge-tts cues vs. script lines) and have a
    *verified* correct sentence, but only the *raw* cues carry real timing.
    When the token counts line up, keep the raw timestamps and swap in the
    verified text (best of both). When they don't, timing can't be trusted
    per-token, so fall back to proportionally distributing the verified
    text across the raw span's overall start/end.
    """
    if not raw_words:
        return []

    no_space = is_no_space_language(verified_text)
    tokens = list(verified_text) if no_space else [
        t for t in verified_text.split(" ") if t
    ]

    if len(tokens) == len(raw_words):
        return [
            Word(token, w.start, w.end) for token, w in zip(tokens, raw_words)
        ]

    return distribute_proportionally(
        verified_text, raw_words[0].start, raw_words[-1].end
    )


def group_words_into_chunks(
    words: list[Word],
    max_words: int = MAX_CHUNK_WORDS,
    max_chars: int = MAX_CHUNK_CHARS,
    min_duration: float = MIN_CHUNK_DURATION,
) -> list[tuple[float, float, str]]:
    """Group timed words into short caption chunks.

    Each chunk respects ``max_words`` OR ``max_chars`` (whichever is hit
    first), prefers to break after punctuation or before a leading
    conjunction, and chunks under ``min_duration`` are merged into a
    neighbour. Returns a list of ``(start, end, text)`` tuples.
    """
    if not words:
        return []

    no_space = is_no_space_language("".join(w.text for w in words))
    join = (lambda ws: "".join(w.text for w in ws)) if no_space else (
        lambda ws: " ".join(w.text for w in ws)
    )
    effective_max_words = float("inf") if no_space else max_words

    raw_chunks: list[list[Word]] = []
    current: list[Word] = []

    for i, word in enumerate(words):
        candidate = current + [word]
        exceeds_words = len(candidate) > effective_max_words
        exceeds_chars = len(join(candidate)) > max_chars

        if current and (exceeds_words or exceeds_chars):
            raw_chunks.append(current)
            current = [word]
        else:
            current.append(word)

        is_last = i == len(words) - 1
        if is_last:
            continue

        stripped = word.text.rstrip()
        ends_clause = stripped and stripped[-1] in _BREAK_PUNCTUATION
        next_is_conjunction = (
            not no_space and words[i + 1].text.strip().lower() in _LEADING_CONJUNCTIONS
        )
        if current and (ends_clause or next_is_conjunction):
            raw_chunks.append(current)
            current = []

    if current:
        raw_chunks.append(current)

    chunks = [(c[0].start, c[-1].end, join(c)) for c in raw_chunks]

    # Merge chunks shorter than min_duration into a neighbour so nothing
    # flashes on screen too briefly to read.
    merged: list[tuple[float, float, str]] = []
    for chunk in chunks:
        start, end, text = chunk
        if merged and (end - start) < min_duration:
            prev_start, prev_end, prev_text = merged[-1]
            sep = "" if no_space else " "
            merged[-1] = (prev_start, end, f"{prev_text}{sep}{text}")
        else:
            merged.append(chunk)

    # A too-short chunk with no predecessor merges forward into the next one.
    i = 0
    while i < len(merged) - 1:
        start, end, text = merged[i]
        if (end - start) < min_duration:
            next_start, next_end, next_text = merged[i + 1]
            sep = "" if no_space else " "
            merged[i : i + 2] = [(start, next_end, f"{text}{sep}{next_text}")]
        else:
            i += 1

    return merged
