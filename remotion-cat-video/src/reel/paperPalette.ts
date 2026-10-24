// Light editorial palette for Film 03 ("readable cut"). A court document, not a dark title card.
//
// Film 01/02 use src/facts/palette.ts (dark brown + gold). That file is NOT touched — it belongs
// to shipped work. This is a separate token set so the two coexist.
//
// Contrast vs `bg` (#F4F1EA). WCAG AA needs 4.5:1 for body, 3:1 for large text.
export const paper = {
  bg: "#F4F1EA", // warm paper
  bgAlt: "#EAE5DA", // card/panel on the same stock
  rule: "#CFC7B8", // hairlines, dividers, table rules
  ink: "#14110E", // primary type
  inkSoft: "#4A443C", // secondary type
  muted: "#6E675C", // labels, docket numbers — never below 32px
  accent: "#C41E33", // signal red (5.20:1 on paper — #D7263D was 4.40 and failed AA): the stamp, the verdict, one emphasis per screen
  ink2: "#1B3A6B", // ink blue: data, measurements, the evidence voice
} as const;
