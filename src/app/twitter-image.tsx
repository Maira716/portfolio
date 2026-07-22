import { ImageResponse } from "next/og";

export const alt = "Maira Reis - Portfólio Profissional";
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
          backgroundColor: "#0b0f19",
          backgroundImage:
            "radial-gradient(circle at 50% 30%, rgba(99, 102, 241, 0.25) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)",
          color: "white",
          fontFamily: "sans-serif",
          padding: "40px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            borderRadius: "32px",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            padding: "40px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "120px",
              height: "120px",
              borderRadius: "32px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)",
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.4)",
              marginBottom: "32px",
            }}
          >
            <span
              style={{
                fontSize: "58px",
                fontWeight: 900,
                color: "white",
                letterSpacing: "-1.5px",
              }}
            >
              MR
            </span>
          </div>

          <div
            style={{
              fontSize: "64px",
              fontWeight: 800,
              letterSpacing: "-1.5px",
              marginBottom: "12px",
              color: "#ffffff",
              textAlign: "center",
            }}
          >
            Maira Reis
          </div>

          <div
            style={{
              fontSize: "30px",
              color: "#c084fc",
              fontWeight: 600,
              marginBottom: "32px",
              letterSpacing: "0.5px",
            }}
          >
            Desenvolvimento Mobile & Web • UX/UI
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
