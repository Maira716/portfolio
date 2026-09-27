import React from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import TrustStats from "@/components/TrustStats";
import Skills from "@/components/Skills";
import TechStack from "@/components/TechStack";
import B2BGuarantees from "@/components/B2BGuarantees";
import ExecutiveCTA from "@/components/ExecutiveCTA";
import Footer from "@/components/Footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maira Reis | UX/UI Design & Desenvolvimento Mobile & Web",
  description: "Desenvolvimento de aplicativos mobile, sistemas web e design UX/UI de alto padrão. Segurança jurídica, prazos rigorosos e foco em resultados corporativos.",
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-500 selection:text-white bg-slate-950 text-white">
      <Header />

      <main className="flex-1 space-y-6 md:space-y-8">
        {/* 1. Hero Section */}
        <Hero />

        {/* 2. Authority & Trust Metrics Bar */}
        <TrustStats />

        {/* 3. Services & Deliverables */}
        <Skills />

        {/* 5. Corporate Tech Stack */}
        <TechStack />

        {/* 6. B2B Guarantees & Legal Security */}
        <B2BGuarantees />

        {/* 7. Executive CTA for Diagnosis & Plans */}
        <ExecutiveCTA />
      </main>

      <Footer />
    </div>
  );
}
