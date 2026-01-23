"use client";

import React from "react";
import { MadeWithDyad } from "@/components/made-with-dyad";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border/40 bg-background/80 backdrop-blur-sm mt-8 py-4">
      <div className="container max-w-screen-2xl flex flex-col md:flex-row items-center justify-between text-center text-sm text-muted-foreground px-4 md:px-8">
        <div className="mb-2 md:mb-0">
          <p className="text-xs md:text-sm">
            🔞 This game is for players 18+ only. Please play responsibly.
          </p>
          <p className="text-xs md:text-sm mt-1">
            Disclaimer: This is a simulated game for demonstration purposes. Real crypto transactions are not processed here.
          </p>
        </div>
        <MadeWithDyad />
      </div>
    </footer>
  );
};

export default Footer;