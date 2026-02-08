"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TelegramLoginProps {
  onSuccess?: () => void;
}

const TelegramLogin: React.FC<TelegramLoginProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [demoUsername, setDemoUsername] = useState("");

  // Check if running inside Telegram WebApp
  const isTelegramWebApp = typeof window !== "undefined" && window.Telegram?.WebApp;

  const handleTelegramLogin = async () => {
    if (isTelegramWebApp) {
      setIsLoading(true);
      try {
        const webApp = window.Telegram.WebApp;
        const user = webApp.initDataUnsafe?.user;

        if (user) {
          await login({
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            photo_url: user.photo_url,
          });
          onSuccess?.();
        }
      } catch (error) {
        console.error("Telegram login failed:", error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Show demo mode for testing outside Telegram
      setDemoMode(true);
    }
  };

  const handleDemoLogin = async () => {
    if (!demoUsername.trim()) return;

    setIsLoading(true);
    try {
      await login({
        id: Math.floor(Math.random() * 1000000) + 1,
        first_name: demoUsername,
        username: demoUsername.toLowerCase().replace(/\s+/g, "_"),
      });
      onSuccess?.();
    } catch (error) {
      console.error("Demo login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-2 border-indigo-500/50 shadow-2xl">
      <CardHeader className="text-center pb-2">
        <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
          </svg>
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          Welcome to DegenFamousBingo!
        </CardTitle>
        <CardDescription className="text-indigo-200">
          Sign in with your Telegram account to play
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {!demoMode ? (
          <>
            <Button
              onClick={handleTelegramLogin}
              disabled={isLoading}
              className={cn(
                "w-full py-6 text-lg font-bold rounded-xl",
                "bg-gradient-to-r from-blue-500 to-cyan-500",
                "hover:from-blue-600 hover:to-cyan-600",
                "shadow-lg shadow-blue-500/30",
                "transition-all duration-300 transform hover:scale-105"
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Connecting...
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                  Continue with Telegram
                </div>
              )}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-indigo-500/30" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-transparent text-indigo-300">
                  One-click signup
                </span>
              </div>
            </div>

            <div className="text-center text-sm text-indigo-300/80">
              <p>By continuing, you agree to our Terms of Service.</p>
              <p className="mt-1">Your Telegram profile will be used to create your account.</p>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
              <p className="text-sm text-yellow-200 text-center">
                Demo Mode - Not inside Telegram
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="demo-username" className="text-white">
                Enter a username to try the app:
              </Label>
              <Input
                id="demo-username"
                value={demoUsername}
                onChange={(e) => setDemoUsername(e.target.value)}
                placeholder="Your name"
                className="bg-white/10 border-indigo-500/50 text-white placeholder:text-indigo-300/50"
              />
            </div>

            <Button
              onClick={handleDemoLogin}
              disabled={isLoading || !demoUsername.trim()}
              className={cn(
                "w-full py-4 font-bold rounded-xl",
                "bg-gradient-to-r from-green-500 to-emerald-500",
                "hover:from-green-600 hover:to-emerald-600",
                "shadow-lg transition-all duration-300"
              )}
            >
              {isLoading ? "Logging in..." : "Try Demo Mode"}
            </Button>

            <Button
              variant="ghost"
              onClick={() => setDemoMode(false)}
              className="w-full text-indigo-300 hover:text-white"
            >
              Back
            </Button>
          </div>
        )}

        {/* Features list */}
        <div className="pt-4 border-t border-indigo-500/30">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="text-green-400">✓</span> Instant signup
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="text-green-400">✓</span> Secure payments
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="text-green-400">✓</span> Win real prizes
            </div>
            <div className="flex items-center gap-2 text-indigo-200">
              <span className="text-green-400">✓</span> 24/7 support
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Add Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
      };
    };
  }
}

export default TelegramLogin;
