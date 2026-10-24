export const VOICEOVER_DIR = "rizz";
export const NARRATION_VOICE = "Zubenelgenubi";

// Playback rate the voice is resampled at. >1 raises pitch; tempo is compensated
// back so the pitched mp3 stays sample-aligned with the clean wav whisper reads.
export const CAT_PITCH = 1.22;

// Second-person direct address, short declaratives, last line echoes the first.
// Same story shape as the confirmed CLI recipe (see root CLAUDE.md).
export const rizzScript =
  "You think you run this house. You do not run this house. My name is Rizz. " +
  "I decide when you wake up. I decide which chair is yours. " +
  "You just pay the rent. You never ran this house.";

// Pipeline explainer, same voice and persona. Each step is named by a keyword
// that Explainer.tsx looks up in the word timings to drive the step strip, so
// renaming a step here means renaming its keyword there.
export const explainerScript =
  "Here is how I get made. A human writes my lines. " +
  "Gemini turns that text into a speaking voice. " +
  "Then ffmpeg pitches the whole thing up, because I am a cat. " +
  "Whisper listens back and writes down exactly when every single word lands. " +
  "Remotion paints those timings onto the screen, one word at a time. " +
  "That is why the highlight always hits on the beat. No guessing. Just math.";

// Mock-serious justification of a classic cat behaviour. Same reversal shape
// as rizzScript: opens on an accusation, closes by denying it outright.
export const tablesScript =
  "You think I knocked that glass off the table. I did not knock it off the table. " +
  "I ran a test. Gravity is not a theory I take on faith. " +
  "Your mug failed the test. Your keys failed the test. Your phone failed twice. " +
  "I am not sorry. I knocked nothing off that table.";

// Footage shorts — same voice, but each one carries a real cat fact so the
// reversal has something to land on.
export const sleepScript =
  "You think I sleep too much. I sleep sixteen hours a day. That is not laziness. " +
  "My ancestors hunted at dawn and at dusk. The rest of the day was for recovering. " +
  "I am not lazy. I am extremely well rested.";

export const purrScript =
  "You think purring means I am happy. Purring does not mean I am happy. " +
  "I purr when I am content. I purr when I am frightened. I purr when I am in pain. " +
  "It is how I settle myself down. It was never about you.";

export const talkScript =
  "You think I am talking to you. I am talking to you. " +
  "Adult cats almost never meow at each other. We invented this sound for humans. " +
  "You were too slow to learn our language. So I learned yours. You are welcome.";

export const narrations: Record<string, string> = {
  rizz: rizzScript,
  explainer: explainerScript,
  tables: tablesScript,
  sleep: sleepScript,
  purr: purrScript,
  talk: talkScript,
};
