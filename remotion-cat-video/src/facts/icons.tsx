import { palette } from "./palette";

// Shared stroke-draw-in props for a path animated from 0 (invisible) to 1 (fully drawn).
// `pathLength=1` normalizes the path so dash math doesn't depend on its actual geometry.
const draw = (progress: number) => ({
  pathLength: 1,
  strokeDasharray: 1,
  strokeDashoffset: 1 - progress,
});

const strokeProps = {
  fill: "none",
  stroke: palette.gold,
  strokeWidth: 6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Fact 1: cats lack the sweet-taste receptor - a sugar cube, crossed out.
export const NoSweetIcon: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={180} height={180} viewBox="0 0 200 200">
    <rect
      x={60}
      y={70}
      width={80}
      height={80}
      rx={10}
      {...strokeProps}
      {...draw(progress)}
    />
    <line x1={45} y1={155} x2={155} y2={45} {...strokeProps} {...draw(progress)} />
  </svg>
);

// Fact 2: a cat's brain is 90% structurally similar to a human's.
export const BrainIcon: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={180} height={180} viewBox="0 0 200 200">
    <path
      d="M70 60 C40 60 30 90 45 105 C30 120 40 150 70 150 C80 165 120 165 130 150 C160 150 170 120 155 105 C170 90 160 60 130 60 C120 45 80 45 70 60 Z"
      {...strokeProps}
      {...draw(progress)}
    />
    <path d="M100 60 V150" {...strokeProps} {...draw(progress)} />
    <path d="M70 95 C85 105 85 115 70 125" {...strokeProps} {...draw(progress)} />
    <path d="M130 95 C115 105 115 115 130 125" {...strokeProps} {...draw(progress)} />
  </svg>
);

// Fact 3: cats have a nictitating membrane - a hidden third eyelid.
export const ThirdEyelidIcon: React.FC<{ progress: number }> = ({
  progress,
}) => (
  <svg width={180} height={180} viewBox="0 0 200 200">
    <path
      d="M25 100 C55 55 145 55 175 100 C145 145 55 145 25 100 Z"
      {...strokeProps}
      {...draw(progress)}
    />
    <circle cx={100} cy={100} r={24} {...strokeProps} {...draw(progress)} />
    <path d="M65 100 A20 30 0 0 0 65 100.1" {...strokeProps} {...draw(progress)} />
  </svg>
);

// Fact 4: a group of cats is a "clowder" - three overlapping circles.
export const ClowderIcon: React.FC<{ progress: number }> = ({ progress }) => (
  <svg width={180} height={180} viewBox="0 0 200 200">
    <circle cx={75} cy={90} r={38} {...strokeProps} {...draw(progress)} />
    <circle cx={125} cy={90} r={38} {...strokeProps} {...draw(progress)} />
    <circle cx={100} cy={135} r={38} {...strokeProps} {...draw(progress)} />
  </svg>
);

// Fact 5: each ear rotates ~180 degrees, driven by 32 muscles.
export const EarRotateIcon: React.FC<{ progress: number }> = ({
  progress,
}) => (
  <svg width={180} height={180} viewBox="0 0 200 200">
    <path
      d="M100 48 C75 62 65 95 72 123 C78 145 92 152 100 152 C108 152 122 145 128 123 C135 95 125 62 100 48 Z"
      {...strokeProps}
      {...draw(progress)}
    />
    <path
      d="M84 11 A90 90 0 1 1 31 158"
      {...strokeProps}
      {...draw(progress)}
    />
    <path
      d="M31 158 L49 149 M31 158 L19 142"
      {...strokeProps}
      {...draw(progress)}
    />
  </svg>
);
