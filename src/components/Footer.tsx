"use client";

import React from "react";
import { Link } from "react-router-dom";
import { MadeWithDyad } from "@/components/MadeWithDyad";
import { Zap, ExternalLink } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full border-t border-purple-500/20 bg-slate-900/95 backdrop-blur-md mt-8 py-6">
      <div className="container max-w-screen-2xl px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo and info */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent">
                DegenFamousBingo
              </span>
            </Link>
            <p className="text-xs text-slate-400 text-center md:text-left max-w-md">
              The most exciting crypto bingo game on Telegram. Play responsibly. 18+
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://t.me/DegenFamousBingo"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-slate-400 hover:text-purple-400 transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Telegram
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-purple-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-slate-400 hover:text-purple-400 transition-colors"
            >
              Privacy
            </a>
          </div>

          {/* MadeWithDyad */}
          <MadeWithDyad />
        </div>

        {/* Disclaimer */}
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            This is a simulated game for demonstration purposes. Real crypto transactions require proper CWallet integration.
            Always gamble responsibly. If you have a gambling problem, seek help.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
