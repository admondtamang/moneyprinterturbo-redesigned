import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import {
  narrations,
  NARRATION_VOICE,
  VOICEOVER_DIR,
  CAT_PITCH,
} from "../src/rizz/script.ts";

// Which narration to voice. `npx tsx scripts/generate-voiceover-rizz.mts explainer`
const slug = process.argv[2] ?? "rizz";
const script = narrations[slug];
if (!script) {
  console.error(
    `unknown narration "${slug}" — expected one of: ${Object.keys(narrations).join(", ")}`,
  );
  process.exit(1);
}

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const outDir = join(import.meta.dirname, `../public/voiceover/${VOICEOVER_DIR}`);
mkdirSync(outDir, { recursive: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const requestSpeech = async (text: string, attempt = 1): Promise<any> => {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: NARRATION_VOICE },
            },
          },
        },
      }),
    },
  );

  if (response.status === 429 && attempt <= 5) {
    const body = await response.text();
    const match = body.match(/"retryDelay":\s*"(\d+)s"/);
    const delaySeconds = match ? Number(match[1]) : 20;
    console.log(`rate limited, retrying in ${delaySeconds}s (attempt ${attempt})`);
    await sleep((delaySeconds + 1) * 1000);
    return requestSpeech(text, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(
      `Gemini TTS request failed: ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
};

const ffmpeg = (args: string[], label: string) => {
  const result = spawnSync("ffmpeg", args);
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed (${label}): ${result.stderr}`);
  }
};

const json = await requestSpeech(script);
const base64Audio = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
if (!base64Audio) {
  throw new Error(`No audio returned: ${JSON.stringify(json)}`);
}

const pcmPath = join(outDir, `${slug}.pcm`);
writeFileSync(pcmPath, Buffer.from(base64Audio, "base64"));

// Gemini TTS returns raw 16-bit PCM, mono, 24kHz.
const pcmInput = ["-f", "s16le", "-ar", "24000", "-ac", "1", "-i", pcmPath];

// Clean 16kHz mono wav — what whisper.cpp transcribes. Never shipped in the video.
ffmpeg(["-y", ...pcmInput, "-ar", "16000", "-ac", "1", join(outDir, `${slug}.clean.wav`)], "wav");

// Cat-pitched mp3 — what the composition plays. asetrate raises pitch, atempo
// puts the duration back, so whisper's word timings stay valid for this file.
ffmpeg(
  [
    "-y",
    ...pcmInput,
    "-af",
    `asetrate=24000*${CAT_PITCH},aresample=24000,atempo=${1 / CAT_PITCH}`,
    join(outDir, `${slug}.mp3`),
  ],
  "mp3",
);

rmSync(pcmPath);
console.log(`generated ${slug}.clean.wav + ${slug}.mp3`);
