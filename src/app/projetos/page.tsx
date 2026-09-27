import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Projects from "@/components/Projects";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Meus Projetos | Maira Reis UX/UI",
  description: "Explore meus projetos de aplicativos e sistemas com simuladores interativos, design de alta fidelidade e foco na experiência do usuário.",
};

export default function ProjetosPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />
      <main className="flex-1 pt-20 pb-6">
        <Projects />
      </main>
      <Footer />
    </div>
  );
}
