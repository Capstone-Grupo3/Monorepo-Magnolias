import { ImageResponse } from "next/og";

export const alt = "Asesorías Magnolia - Portal de Empleo IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #465fff 0%, #3641f5 100%)",
          color: "white",
          fontFamily: "system-ui",
        }}
      >
        <div style={{ fontSize: 80, fontWeight: "bold", marginBottom: 20 }}>
          Asesorías Magnolia
        </div>
        <div style={{ fontSize: 40, opacity: 0.9 }}>
          Portal de Empleo IA
        </div>
        <div style={{ fontSize: 24, opacity: 0.7, marginTop: 40 }}>
          Reclutamiento inteligente con IA para PyMEs
        </div>
      </div>
    ),
    { ...size },
  );
}
