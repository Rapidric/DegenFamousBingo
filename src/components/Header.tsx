"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DollarSign, User } from "lucide-react";

const Header = () => {
  // Placeholder for user data and wallet balance
  const userName = "BingoPlayer123";
  const walletBalance = "100.50 USDT";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl text-primary">Bingo Blitz! 🎉</span>
        </Link>
        <nav className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/game">
              <Button variant="ghost" className="rounded-lg text-primary hover:bg-accent hover:text-primary">
                Play Bingo
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="ghost" className="rounded-lg text-primary hover:bg-accent hover:text-primary">
                Admin
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 bg-accent/20 px-3 py-1 rounded-full text-sm font-medium text-primary">
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </div>
            <div className="flex items-center space-x-1 bg-accent/20 px-3 py-1 rounded-full text-sm font-medium text-primary">
              <DollarSign className="h-4 w-4" />
              <span>{walletBalance}</span>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;