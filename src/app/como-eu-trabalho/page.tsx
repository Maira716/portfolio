import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Process from "@/components/Process";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Como Eu Trabalho | Maira Reis UX/UI & Mobile",
  description: "Conheça o processo de desenvolvimento passo a passo: diagnóstico, protótipo visual no celular, codificação segura e lançamento com suporte.",
};

export default function ComoEuTrabalhoPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />
      <main className="flex-1 pt-20 pb-6">
        <Process />
      </main>
      <Footer />
    </div>
  );
}
