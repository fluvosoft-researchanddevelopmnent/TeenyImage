import { ImageResponse } from "next/og";

export const alt = "TeenyImage — Free Online Image Tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f7",
          fontFamily: "sans-serif",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Subtle decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "700px",
            height: "350px",
            background: "rgba(229, 50, 45, 0.12)",
            borderRadius: "50%",
            filter: "blur(80px)",
          }}
        />

        {/* Card Container */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#ffffff",
            border: "2px solid #e8e6e3",
            borderRadius: "32px",
            padding: "60px 80px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
            width: "100%",
            maxWidth: "1050px",
            textAlign: "center",
          }}
        >
          {/* Logo Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                backgroundColor: "#e5322d",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: "26px",
                fontWeight: "bold",
              }}
            >
              TI
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#e5322d",
                letterSpacing: "-0.5px",
              }}
            >
              TeenyImage
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: "46px",
              fontWeight: "800",
              color: "#000000",
              lineHeight: 1.2,
              marginBottom: "18px",
              letterSpacing: "-1px",
            }}
          >
            Every Image Tool You Need — 100% Private
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "22px",
              color: "#4a4a4a",
              lineHeight: 1.4,
              marginBottom: "36px",
              maxWidth: "800px",
            }}
          >
            Compress, resize, crop, convert, edit, and optimize images directly in your browser. No uploads, no accounts, no tracking.
          </div>

          {/* Pill Badges */}
          <div
            style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div
              style={{
                backgroundColor: "#e8f7ef",
                color: "#16a34a",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              • 100% Client-Side
            </div>
            <div
              style={{
                backgroundColor: "#e8f0fe",
                color: "#2563eb",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              • 16 Free Tools
            </div>
            <div
              style={{
                backgroundColor: "#fef2f2",
                color: "#dc2626",
                padding: "8px 20px",
                borderRadius: "999px",
                fontSize: "15px",
                fontWeight: "700",
              }}
            >
              • Zero Server Uploads
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}