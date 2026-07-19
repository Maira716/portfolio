import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Portfólio Profissional | Desenvolvedora Web",
  description: "Portfólio de projetos, desenvolvimento web front-end e fullstack com React, Next.js, TypeScript e Vercel.",
  keywords: ["Portfólio", "Desenvolvedora Web", "React", "Next.js", "TypeScript", "Tailwind CSS", "Vercel", "GitHub"],
  authors: [{ name: "Maira Reis" }],
  openGraph: {
    title: "Portfólio Profissional | Desenvolvedora Web",
    description: "Projetos, habilidades e soluções web modernas.",
    type: "website",
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
