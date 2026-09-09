import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";

export const { fontFamily: serif } = loadFraunces("normal", {
  weights: ["600", "700", "900"],
  subsets: ["latin"],
});

export const { fontFamily: sans } = loadInter("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});
