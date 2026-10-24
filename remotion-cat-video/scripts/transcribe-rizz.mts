import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import { VOICEOVER_DIR } from "../src/rizz/script.ts";

// Which voiceover to transcribe. Must match the generate-voiceover slug.
const slug = process.argv[2] ?? "rizz";

const WHISPER_VERSION = "1.5.5";
const MODEL = "base.en";

const whisperPath = join(import.meta.dirname, "../whisper.cpp");

await installWhisperCpp({ to: whisperPath, version: WHISPER_VERSION });
await downloadWhisperModel({ model: MODEL, folder: whisperPath });

// Transcribes the CLEAN wav, not the pitched mp3 — whisper mishears a chipmunk
// voice. Both files are the same length, so the word timings apply to either.
const whisperCppOutput = await transcribe({
  model: MODEL,
  whisperPath,
  whisperCppVersion: WHISPER_VERSION,
  inputPath: join(
    import.meta.dirname,
    `../public/voiceover/${VOICEOVER_DIR}/${slug}.clean.wav`,
  ),
  tokenLevelTimestamps: true,
});

const { captions } = toCaptions({ whisperCppOutput });

// Whisper emits sub-word tokens ("\u00a0R" + "iz"). A continuation token has no
// leading space, so folding it into the previous token rebuilds whole words —
// which is what per-word karaoke highlighting needs. Punctuation folds in too.
const merged: typeof captions = [];
for (const caption of captions) {
  const previous = merged[merged.length - 1];
  if (previous && !caption.text.startsWith(" ")) {
    previous.text += caption.text;
    previous.endMs = caption.endMs;
    previous.timestampMs = caption.timestampMs;
    continue;
  }
  merged.push({ ...caption });
}

// Whisper has no way to know the mascot's name is spelled with two Z's.
const SPELLING: Record<string, string> = { riz: "Rizz", rizz: "Rizz" };
const corrected = merged.map((caption) => {
  const bare = caption.text.trim().replace(/[.,!?]/g, "");
  const fix = SPELLING[bare.toLowerCase()];
  return fix ? { ...caption, text: caption.text.replace(bare, fix) } : caption;
});

const outPath = join(import.meta.dirname, `../src/rizz/captions.${slug}.json`);
writeFileSync(outPath, JSON.stringify(corrected, null, 2));
console.log(`wrote ${corrected.length} tokens to ${outPath}`);
