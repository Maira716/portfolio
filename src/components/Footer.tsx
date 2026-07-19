"use client";

import React from "react";
import { Code2, Heart, ExternalLink } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 py-10 px-4 lg:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Code2 size={18} />
          </div>
          <span className="font-semibold text-gradient text-sm">
            Portfólio &copy; {currentYear}
          </span>
        </div>

        <p className="text-xs text-gray-400 flex items-center gap-1">
          Desenvolvido com <Heart size={14} className="text-pink-500 fill-pink-500" /> utilizando Next.js, TypeScript e Vercel.
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            GitHub <ExternalLink size={12} />
          </a>
          <span>•</span>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            Vercel <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </footer>
  );
}
