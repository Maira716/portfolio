import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mairareis.com.br";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Maira Reis | Portfólio Profissional & Desenvolvimento Mobile/Web",
  description:
    "Maira Reis (MR) — Desenvolvedora Mobile e Web especializada em UX/UI, React, Next.js, React Native e TypeScript. Confira meus projetos e soluções digitais de alto nível.",
  keywords: [
    "Maira Reis",
    "MR",
    "Portfólio Maira Reis",
    "Desenvolvedora Mobile",
    "Desenvolvedora Web",
    "React",
    "Next.js",
    "React Native",
    "TypeScript",
    "UX/UI",
  ],
  authors: [{ name: "Maira Reis" }],
  creator: "Maira Reis",
  publisher: "Maira Reis",
  openGraph: {
    title: "Maira Reis | Portfólio Profissional (MR)",
    description:
      "Desenvolvimento Mobile & Web, UX/UI e soluções digitais de alto impacto por Maira Reis.",
    url: SITE_URL,
    siteName: "Maira Reis - Portfólio (MR)",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Maira Reis | Portfólio Profissional (MR)",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Maira Reis | Portfólio Profissional (MR)",
    description:
      "Desenvolvimento Mobile & Web, UX/UI e soluções digitais por Maira Reis.",
    images: [`${SITE_URL}/og-image.png`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
