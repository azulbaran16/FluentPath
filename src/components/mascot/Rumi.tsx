import type { CSSProperties } from "react";

export type RumiMood = "idle" | "happy" | "thinking" | "sleeping";

/**
 * Rumi — FluentPath's fox companion. A single inline SVG with mood-driven
 * CSS animations (see the `.rumi` block in globals.css). Cross-browser,
 * GPU-friendly transforms only, and silenced by prefers-reduced-motion.
 */
export function Rumi({
  mood = "idle",
  size = 96,
  className = "",
  style,
}: {
  mood?: RumiMood;
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const sleeping = mood === "sleeping";
  return (
    <svg
      className={`rumi ${className}`}
      data-mood={mood}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Rumi the fox"
      style={style}
    >
      <g className="rumi-body">
        {/* tail */}
        <g className="rumi-tail">
          <path d="M34 92 C12 92 14 66 30 70 C24 80 30 88 40 86 Z" fill="#E07A3F" />
          <path d="M22 80 C16 78 16 72 24 72 C22 76 24 80 30 80 Z" fill="#FBF3E7" />
        </g>
        {/* body + scarf */}
        <ellipse cx="62" cy="94" rx="26" ry="18" fill="#E07A3F" />
        <ellipse cx="62" cy="98" rx="15" ry="11" fill="#FBF3E7" />
        <rect x="40" y="84" width="44" height="9" rx="4" fill="var(--teal)" />
        <path d="M44 86 L40 96 L48 90 Z" fill="var(--teal-deep, #16786A)" />
        {/* head */}
        <g className="rumi-head">
          <polygon points="42,40 38,18 56,34" fill="#E07A3F" />
          <polygon points="82,40 86,18 68,34" fill="#E07A3F" />
          <polygon points="44,36 42,24 52,33" fill="#D85A80" />
          <polygon points="80,36 82,24 72,33" fill="#D85A80" />
          <circle cx="62" cy="56" r="25" fill="#E07A3F" />
          <path d="M42 58 Q62 92 82 58 Q62 70 42 58 Z" fill="#FBF3E7" />
          {sleeping ? (
            <>
              <path d="M48 55 Q53 59 58 55" fill="none" stroke="#3A2A20" strokeWidth="2.4" strokeLinecap="round" />
              <path d="M66 55 Q71 59 76 55" fill="none" stroke="#3A2A20" strokeWidth="2.4" strokeLinecap="round" />
              <text className="rumi-z" x="86" y="34" fontSize="13" fill="#9C6B3E" fontWeight="700">z</text>
              <text className="rumi-z rumi-z2" x="94" y="24" fontSize="10" fill="#B98a55" fontWeight="700">z</text>
            </>
          ) : (
            <>
              <g className="rumi-eye" style={{ transformOrigin: "53px 54px" }}>
                <circle cx="53" cy="54" r="3.4" fill="#3A2A20" />
              </g>
              <g className="rumi-eye" style={{ transformOrigin: "71px 54px" }}>
                <circle cx="71" cy="54" r="3.4" fill="#3A2A20" />
              </g>
            </>
          )}
          <circle cx="62" cy="66" r="3.2" fill="#3A2A20" />
        </g>
      </g>
    </svg>
  );
}
