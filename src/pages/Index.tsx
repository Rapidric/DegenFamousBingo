"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-2xl text-center p-6 md:p-10 rounded-xl shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-4xl md:text-5xl font-extrabold text-primary mb-4 animate-pulse">
            Welcome to DegenFamousBingo! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            Get ready for an electrifying experience! Buy your cards, join a game, and shout BINGO!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/game">
              <Button className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
                Play Now! 🚀
              </Button>
            </Link>
            <Link to="/admin">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Admin Panel ⚙️
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>New players get a free card on their first purchase! 🎁</p>
            <p>Join our community and climb the leaderboards! 🏆</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;