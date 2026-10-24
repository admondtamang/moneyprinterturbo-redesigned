import { writeFileSync, mkdirSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import {
  narrationLines,
  NARRATION_VOICE,
  VOICEOVER_DIR,
} from "../src/facts/mythsNarration.ts";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("GEMINI_API_KEY is not set");
  process.exit(1);
}

const outDir = join(import.meta.dirname, `../public/voiceover/${VOICEOVER_DIR}`);
mkdirSync(outDir, { recursive: true });

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const requestSpeech = async (id: string, text: string, attempt = 1): Promise<any> => {
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
    console.log(
      `rate limited on "${id}", retrying in ${delaySeconds}s (attempt ${attempt})`,
    );
    await sleep((delaySeconds + 1) * 1000);
    return requestSpeech(id, text, attempt + 1);
  }

  if (!response.ok) {
    throw new Error(
      `Gemini TTS request failed for "${id}": ${response.status} ${await response.text()}`,
    );
  }

  return response.json();
};

const generateOne = async (id: string, text: string) => {
  const json = await requestSpeech(id, text);
  const part = json.candidates?.[0]?.content?.parts?.[0];
  const base64Audio = part?.inlineData?.data;
  if (!base64Audio) {
    throw new Error(`No audio returned for "${id}": ${JSON.stringify(json)}`);
  }

  const pcmBuffer = Buffer.from(base64Audio, "base64");
  const pcmPath = join(outDir, `${id}.pcm`);
  const mp3Path = join(outDir, `${id}.mp3`);
  writeFileSync(pcmPath, pcmBuffer);

  // Gemini TTS returns raw 16-bit PCM, mono, 24kHz.
  const result = spawnSync("ffmpeg", [
    "-y",
    "-f",
    "s16le",
    "-ar",
    "24000",
    "-ac",
    "1",
    "-i",
    pcmPath,
    mp3Path,
  ]);
  rmSync(pcmPath);

  if (result.status !== 0) {
    throw new Error(`ffmpeg failed for "${id}": ${result.stderr}`);
  }

  console.log(`generated ${id}.mp3`);
};

for (const line of narrationLines) {
  await generateOne(line.id, line.text);
}
