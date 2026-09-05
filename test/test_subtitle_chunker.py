from app.services.subtitle_chunker import (
    Word,
    distribute_proportionally,
    group_words_into_chunks,
    is_no_space_language,
    resolve_chunk_words,
)


def _words(text_starts_ends):
    return [Word(t, s, e) for t, s, e in text_starts_ends]


def test_group_words_respects_max_word_limit():
    words = _words(
        [(w, i * 0.3, i * 0.3 + 0.3) for i, w in enumerate(["one", "two", "three", "four", "five"])]
    )
    chunks = group_words_into_chunks(words, max_words=4, max_chars=1000, min_duration=0.0)
    assert [text for _, _, text in chunks] == ["one two three four", "five"]


def test_group_words_respects_max_char_limit():
    words = _words([("supercalifragilistic", 0.0, 1.0), ("word", 1.0, 2.0)])
    chunks = group_words_into_chunks(words, max_words=100, max_chars=22, min_duration=0.0)
    assert [text for _, _, text in chunks] == ["supercalifragilistic", "word"]


def test_group_words_breaks_on_punctuation():
    words = _words(
        [
            ("Have", 0.0, 0.2),
            ("you", 0.2, 0.4),
            ("wondered,", 0.4, 0.6),
            ("truly?", 0.6, 0.8),
        ]
    )
    chunks = group_words_into_chunks(words, max_words=100, max_chars=1000, min_duration=0.0)
    assert [text for _, _, text in chunks] == ["Have you wondered,", "truly?"]


def test_group_words_breaks_before_leading_conjunction():
    words = _words(
        [
            ("Cats", 0.0, 0.2),
            ("sleep", 0.2, 0.4),
            ("a", 0.4, 0.6),
            ("lot", 0.6, 0.8),
            ("but", 0.8, 1.0),
            ("stay", 1.0, 1.2),
            ("alert", 1.2, 1.4),
        ]
    )
    chunks = group_words_into_chunks(words, max_words=100, max_chars=1000, min_duration=0.0)
    assert [text for _, _, text in chunks] == ["Cats sleep a lot", "but stay alert"]


def test_group_words_merges_chunks_shorter_than_min_duration():
    # "Hi." would be its own chunk (punctuation break) but is far too brief
    # on screen alone, so it must merge into a neighbour.
    words = _words([("Hi.", 0.0, 0.1), ("Long", 0.1, 0.6), ("greeting", 0.6, 1.1)])
    chunks = group_words_into_chunks(words, max_words=100, max_chars=1000, min_duration=0.5)
    assert len(chunks) == 1
    assert chunks[0][2] == "Hi. Long greeting"
    assert chunks[0][0] == 0.0
    assert chunks[0][1] == 1.1


def test_group_words_no_space_language_chunks_by_char_count_only():
    # Mandarin: no spaces, word-count cap must not apply; only max_chars does.
    chars = list("这是一只非常可爱又聪明的猫")
    words = _words([(c, i * 0.1, i * 0.1 + 0.1) for i, c in enumerate(chars)])
    chunks = group_words_into_chunks(words, max_words=4, max_chars=6, min_duration=0.0)
    assert all(len(text) <= 6 for _, _, text in chunks)
    assert "".join(text for _, _, text in chunks) == "这是一只非常可爱又聪明的猫"


def test_is_no_space_language():
    assert is_no_space_language("这是一只猫") is True
    assert is_no_space_language("this is a cat") is False


def test_distribute_proportionally_splits_by_char_count():
    words = distribute_proportionally("a bb ccc", start=0.0, end=6.0)
    assert [w.text for w in words] == ["a", "bb", "ccc"]
    # weights: 2, 3, 4 (char count + 1 for trailing space) -> total 9
    assert words[0].end - words[0].start == 6.0 * (2 / 9)
    assert words[-1].end == 6.0


def test_distribute_proportionally_no_space_language_splits_by_character():
    words = distribute_proportionally("猫咪", start=0.0, end=2.0)
    assert [w.text for w in words] == ["猫", "咪"]
    assert words[-1].end == 2.0


def test_group_words_empty_input_returns_empty_list():
    assert group_words_into_chunks([]) == []


def test_resolve_chunk_words_keeps_real_timing_when_counts_match():
    raw = _words([("teh", 0.0, 0.3), ("cat", 0.3, 0.6)])  # cue typo, still 2 tokens
    resolved = resolve_chunk_words(raw, "the cat")
    assert [w.text for w in resolved] == ["the", "cat"]
    assert resolved[0].start == 0.0 and resolved[1].end == 0.6


def test_resolve_chunk_words_falls_back_to_proportional_when_counts_differ():
    # One cue covers the entire sentence with no spaces — token counts
    # can't line up, so timing must fall back to proportional distribution
    # across the raw cue's overall span, using the verified text.
    raw = _words([("Thecatsleeps", 0.0, 1.0)])
    resolved = resolve_chunk_words(raw, "The cat sleeps")
    assert [w.text for w in resolved] == ["The", "cat", "sleeps"]
    assert resolved[0].start == 0.0
    assert resolved[-1].end == 1.0


def test_resolve_chunk_words_empty_raw_words_returns_empty():
    assert resolve_chunk_words([], "anything") == []
