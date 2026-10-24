import {
  RotateArrowIcon,
  SoundWaveIcon,
  BondHeartIcon,
  NoMilkIcon,
  SpeechBubbleIcon,
} from "./icons";
import type { Fact } from "./factsData";

export const mythFacts: Fact[] = [
  {
    number: "01",
    title: "They don't always land on their feet",
    detail:
      "The righting reflex needs about a second to work — a fall from a low height can be more dangerous, not less.",
    Icon: RotateArrowIcon,
  },
  {
    number: "02",
    title: "Purring doesn't always mean happy",
    detail:
      "Cats also purr when they're anxious, in pain, or dying — it's a self-soothing reflex, not just contentment.",
    Icon: SoundWaveIcon,
  },
  {
    number: "03",
    title: "They're not actually loners",
    detail:
      "Cats form real attachments and can show measurable stress when separated from their favorite person.",
    Icon: BondHeartIcon,
  },
  {
    number: "04",
    title: "Milk upsets most adult cats",
    detail:
      "Most cats lose the enzyme to digest lactose after kittenhood — a saucer of milk usually means an upset stomach.",
    Icon: NoMilkIcon,
  },
  {
    number: "05",
    title: "They only meow for us",
    detail:
      "Adult cats rarely meow at each other — meowing is a behavior they developed specifically to talk to humans.",
    Icon: SpeechBubbleIcon,
  },
];
