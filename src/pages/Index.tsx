"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  Gamepad2,
  Shield,
  Trophy,
  Wallet,
  Users,
  Zap,
  Sparkles,
  Star,
  Gift,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const { user, isLoading } = useAuth();

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-pulse"
            style={{
              width: `${Math.random() * 100 + 50}px`,
              height: `${Math.random() * 100 + 50}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `radial-gradient(circle, ${
                ["#f472b6", "#a855f7", "#3b82f6", "#22c55e", "#eab308"][Math.floor(Math.random() * 5)]
              } 0%, transparent 70%)`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative container mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-300 mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold">Powered by Telegram + CWallet</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
              DegenFamous
            </span>
            <br />
            <span className="text-white">Bingo</span>
          </h1>

          <p className="text-xl md:text-2xl text-purple-200 max-w-2xl mx-auto mb-10">
            The most exciting crypto bingo game on Telegram!
            Buy cards, win prizes, and have fun with players worldwide.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/game">
              <Button
                size="lg"
                className={cn(
                  "px-8 py-6 text-xl font-bold rounded-full",
                  "bg-gradient-to-r from-yellow-400 to-orange-500",
                  "hover:from-yellow-500 hover:to-orange-600",
                  "shadow-lg shadow-yellow-500/30",
                  "transition-all duration-300 transform hover:scale-105"
                )}
              >
                <Gamepad2 className="w-6 h-6 mr-2" />
                Play Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/admin">
              <Button
                size="lg"
                variant="outline"
                className={cn(
                  "px-8 py-6 text-xl font-bold rounded-full",
                  "border-2 border-purple-400 text-purple-300",
                  "hover:bg-purple-500/20 hover:border-purple-300",
                  "transition-all duration-300 transform hover:scale-105"
                )}
              >
                <Shield className="w-6 h-6 mr-2" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border-pink-500/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Instant Play</h3>
              <p className="text-pink-200/80">One-click signup with Telegram. Start playing in seconds!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">CWallet Payments</h3>
              <p className="text-green-200/80">Secure crypto payments. Deposit & withdraw with ease!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Multiplayer</h3>
              <p className="text-blue-200/80">Compete with players worldwide in real-time games!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/30 hover:border-yellow-400/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Win Big</h3>
              <p className="text-yellow-200/80">90% of the prize pool goes to winners!</p>
            </CardContent>
          </Card>
        </div>

        {/* How it works */}
        <div className="max-w-4xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl font-black text-white">
                1
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Sign Up</h3>
              <p className="text-purple-200/80">
                Connect with Telegram in one click. No forms, no hassle.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-black text-white">
                2
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Buy Cards</h3>
              <p className="text-purple-200/80">
                Choose your cards and pay securely with CWallet.
              </p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl font-black text-white">
                3
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Win Prizes!</h3>
              <p className="text-purple-200/80">
                Watch the draw and shout BINGO! Winners take 90% of the pool.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="max-w-3xl mx-auto">
          <Card className="bg-gradient-to-r from-yellow-500/30 via-orange-500/30 to-pink-500/30 border-yellow-500/50">
            <CardContent className="p-8 md:p-12 text-center">
              <Gift className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Win?
              </h2>
              <p className="text-xl text-yellow-100/80 mb-8">
                Join thousands of players and start winning today!
                New players get bonus funds on first deposit.
              </p>
              <Link to="/game">
                <Button
                  size="lg"
                  className={cn(
                    "px-10 py-6 text-xl font-bold rounded-full",
                    "bg-gradient-to-r from-yellow-400 to-orange-500",
                    "hover:from-yellow-500 hover:to-orange-600",
                    "shadow-lg shadow-yellow-500/30",
                    "transition-all duration-300 transform hover:scale-105"
                  )}
                >
                  <Star className="w-6 h-6 mr-2" />
                  Start Playing Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
              10K+
            </p>
            <p className="text-purple-200/80">Players</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              $50K+
            </p>
            <p className="text-purple-200/80">Prizes Won</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              5K+
            </p>
            <p className="text-purple-200/80">Games Played</p>
          </div>
          <div className="text-center">
            <p className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
              24/7
            </p>
            <p className="text-purple-200/80">Live Support</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
