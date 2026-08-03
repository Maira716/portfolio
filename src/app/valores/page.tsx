import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PricingSection from "@/components/PricingSection";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Valores e Investimento | Maira Reis UX/UI & Mobile",
  description: "Confira os pacotes e tabela de investimentos para desenvolvimento de aplicativos mobile, sites responsivos, sistemas web e design UX/UI.",
};

export default function ValoresPage() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />
      <main className="flex-1 pt-24 pb-16">
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
