import {
  BrainIcon,
  ClowderIcon,
  EarRotateIcon,
  NoSweetIcon,
  ThirdEyelidIcon,
} from "./icons";

export type Fact = {
  number: string;
  title: string;
  detail: string;
  Icon: React.FC<{ progress: number }>;
};

export const facts: Fact[] = [
  {
    number: "01",
    title: "Cats can't taste sweetness",
    detail:
      "A broken gene leaves them without sweet-taste receptors — sugar is invisible to a cat's tongue.",
    Icon: NoSweetIcon,
  },
  {
    number: "02",
    title: "Their brain is 90% like ours",
    detail:
      "Structurally, a cat's brain shares more in common with a human brain than with a dog's.",
    Icon: BrainIcon,
  },
  {
    number: "03",
    title: "They have a hidden third eyelid",
    detail:
      "The nictitating membrane sweeps across the eye to protect and moisten it — usually unseen.",
    Icon: ThirdEyelidIcon,
  },
  {
    number: "04",
    title: "A group of cats is a “clowder”",
    detail:
      "And a group of kittens has its own name too: a “kindle.”",
    Icon: ClowderIcon,
  },
  {
    number: "05",
    title: "Each ear turns almost 180°",
    detail:
      "32 muscles per ear let a cat rotate them independently to pinpoint a sound's exact source.",
    Icon: EarRotateIcon,
  },
];
