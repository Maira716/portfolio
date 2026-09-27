import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import About from "@/components/About";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre Mim | Maira Reis UX/UI & Mobile",
  description: "Conheça Maira Reis, desenvolvedora especialista em criação de aplicativos mobile e plataformas digitais com foco em usabilidade, segurança e resultados de negócio.",
};

export default function SobrePage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />
      <main className="flex-1 pt-24 pb-8">
        <About />
      </main>
      <Footer />
    </div>
  );
}
