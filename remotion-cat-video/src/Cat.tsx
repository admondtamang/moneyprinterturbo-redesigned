import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";

// A cartoon cat drawn entirely from CSS shapes - no video or image assets.
export const Cat: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const blink =
    frame % (3 * fps) < 6
      ? interpolate(frame % (3 * fps), [0, 3, 6], [1, 0.05, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        })
      : 1;

  const tailRotate = interpolate(
    Math.sin((frame / fps) * 2),
    [-1, 1],
    [-18, 18],
  );

  const earTwitchLeft = interpolate(
    frame % (2 * fps),
    [0, 4, 8, 2 * fps],
    [0, -8, 0, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const breathe = interpolate(
    Math.sin((frame / fps) * 1.4),
    [-1, 1],
    [0.98, 1.02],
  );

  return (
    <div
      style={{
        position: "relative",
        width: 520,
        height: 520,
        scale: breathe,
      }}
    >
      {/* tail */}
      <div
        style={{
          position: "absolute",
          left: 420,
          top: 300,
          width: 160,
          height: 46,
          borderRadius: 30,
          background: "#e8934a",
          transformOrigin: "0% 50%",
          rotate: `${tailRotate}deg`,
        }}
      />

      {/* body */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 260,
          width: 400,
          height: 260,
          borderRadius: "50% 50% 40% 40%",
          background: "#f0a561",
        }}
      />

      {/* head */}
      <div
        style={{
          position: "absolute",
          left: 90,
          top: 40,
          width: 340,
          height: 300,
          borderRadius: "50%",
          background: "#f0a561",
        }}
      >
        {/* left ear */}
        <div
          style={{
            position: "absolute",
            left: -10,
            top: -60,
            width: 0,
            height: 0,
            borderLeft: "60px solid transparent",
            borderRight: "60px solid transparent",
            borderBottom: "110px solid #f0a561",
            transformOrigin: "50% 100%",
            rotate: `${-24 + earTwitchLeft}deg`,
          }}
        />
        {/* right ear */}
        <div
          style={{
            position: "absolute",
            right: -10,
            top: -60,
            width: 0,
            height: 0,
            borderLeft: "60px solid transparent",
            borderRight: "60px solid transparent",
            borderBottom: "110px solid #f0a561",
            rotate: "24deg",
          }}
        />
        {/* inner ears */}
        <div
          style={{
            position: "absolute",
            left: 18,
            top: -34,
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: "58px solid #ffd4b0",
            rotate: `${-24 + earTwitchLeft}deg`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 18,
            top: -34,
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: "58px solid #ffd4b0",
            rotate: "24deg",
          }}
        />

        {/* eyes */}
        <div
          style={{
            position: "absolute",
            left: 70,
            top: 130,
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#2b2320",
            scale: `1 ${blink}`,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 70,
            top: 130,
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "#2b2320",
            scale: `1 ${blink}`,
          }}
        />

        {/* nose */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 190,
            width: 0,
            height: 0,
            translate: "-50% 0",
            borderLeft: "14px solid transparent",
            borderRight: "14px solid transparent",
            borderTop: "12px solid #d9645f",
          }}
        />

        {/* mouth */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 206,
            width: 44,
            height: 24,
            translate: "-50% 0",
            borderBottom: "4px solid #2b2320",
            borderLeft: "4px solid #2b2320",
            borderBottomLeftRadius: 20,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: 206,
            width: 44,
            height: 24,
            translate: "-50% 0",
            borderBottom: "4px solid #2b2320",
            borderRight: "4px solid #2b2320",
            borderBottomRightRadius: 20,
          }}
        />

        {/* whiskers */}
        {[0, 1, 2].map((i) => (
          <div
            key={`whisker-left-${i}`}
            style={{
              position: "absolute",
              left: -70,
              top: 168 + i * 16,
              width: 80,
              height: 3,
              background: "#2b2320",
              opacity: 0.6,
              rotate: `${(i - 1) * 8}deg`,
            }}
          />
        ))}
        {[0, 1, 2].map((i) => (
          <div
            key={`whisker-right-${i}`}
            style={{
              position: "absolute",
              right: -70,
              top: 168 + i * 16,
              width: 80,
              height: 3,
              background: "#2b2320",
              opacity: 0.6,
              rotate: `${(1 - i) * 8}deg`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
