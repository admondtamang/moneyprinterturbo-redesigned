// Guards the readable cut's contrast floor. Run: npx tsx src/reel/paper.check.ts
// Readability was the #1 complaint on the dark cut. Contrast is not a matter of taste, so it
// is asserted rather than eyeballed.
import { paper } from "./paperPalette";

const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => lin(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

let n = 0;
const need = (token: keyof typeof paper, min: number) => {
  const r = ratio(paper[token], paper.bg);
  if (r < min) {
    throw new Error(`FAIL ${token}: ${r.toFixed(2)}:1 vs bg, need >= ${min}:1`);
  }
  console.log(`  ${token.padEnd(8)} ${r.toFixed(2)}:1`);
  n++;
};

console.log("contrast vs paper bg:");
need("ink", 7); // body + headlines, AAA
need("inkSoft", 7); // secondary, AAA
need("muted", 4.5); // labels, AA
need("ink2", 7); // data voice, AAA
need("accent", 4.5); // large text + marks, AA
console.log(`paper.check: ${n} contrast assertions passed`);
