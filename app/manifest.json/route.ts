import { NextResponse } from 'next/server';

export async function GET() {
  const manifest = {
    name: "CORNOS BRASIL - Videos Porno de Sexo Amador",
    short_name: "CORNOS BRASIL",
    description: "Videos porno de sexo amador brasileiro. Assista videos de corno, porno amador, videos porno grátis.",
    start_url: "/",
    display: "standalone",
    background_color: "#1a1a1a",
    theme_color: "#ff4444",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/favicon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any maskable"
      },
      {
        src: "/imgs/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable"
      }
    ],
    categories: ["adult", "entertainment"],
    lang: "pt-BR",
    dir: "ltr",
    scope: "/",
    prefer_related_applications: false,
    related_applications: [],
    screenshots: [
      {
        src: "/imgs/logo.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "CORNOS BRASIL - Videos Porno Amador"
      }
    ]
  };

  return NextResponse.json(manifest, {
    headers: { 
      'Cache-Control': 'public, max-age=86400, s-maxage=86400'
    },
  });
}
