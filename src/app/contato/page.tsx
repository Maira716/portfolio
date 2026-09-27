import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato & Orçamentos | Maira Reis UX/UI & Mobile",
  description: "Entre em contato diretamente para solicitar um orçamento ou agendar uma reunião sobre o seu projeto de aplicativo mobile ou web.",
};

export default function ContatoPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />
      <main className="flex-1 pt-24 pb-8">
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
