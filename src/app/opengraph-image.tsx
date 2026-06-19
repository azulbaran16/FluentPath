import { ImageResponse } from "next/og";

export const alt = "FluentPath — Speak English for real life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded social-share card (Open Graph / Twitter).
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#faf4e9",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              backgroundColor: "#e0492a",
              color: "#faf4e9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 44,
              fontWeight: 700,
            }}
          >
            F
          </div>
          <div style={{ fontSize: 40, fontWeight: 700, color: "#211b14" }}>
            FluentPath
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 84,
              fontWeight: 700,
              color: "#211b14",
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            <div style={{ display: "flex" }}>Speak English</div>
            <div style={{ display: "flex", gap: 22 }}>
              <span>like you</span>
              <span style={{ color: "#e0492a" }}>live</span>
              <span>it.</span>
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 32, color: "#4a4136", maxWidth: 900 }}>
            Real-life scenarios, an AI tutor, and a memory engine that makes it
            stick.
          </div>
        </div>

        <div style={{ fontSize: 26, color: "#8a7d6b" }}>
          Speaking · Grammar · Reading · Writing
        </div>
      </div>
    ),
    size,
  );
}
