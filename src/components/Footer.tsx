"use client";

import React from "react";
import { Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 mt-10 sm:mt-14 bg-[#080b14]/90 backdrop-blur-xl">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start flex-wrap">
            <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
              Maira Reis <span className="text-gradient">UX/UI</span>
            </span>
            <span className="text-gray-500">•</span>
            <span>&copy; {currentYear} Todos os direitos reservados.</span>
          </div>

          <span className="flex items-center gap-1.5 justify-center text-xs text-gray-300">
            Transformando Ideias em Experiências Digitais Memoráveis <Heart size={13} className="text-pink-500 fill-pink-500 inline shrink-0" />
          </span>
        </div>
      </div>
    </footer>
  );
}
