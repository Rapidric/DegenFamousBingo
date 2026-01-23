"use client";

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Gamepad2, RefreshCcw, History, Users } from "lucide-react";
import { toast } from "sonner"; // Using sonner toast
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast"; // Import toast utilities
import { cn } from "@/lib/utils";

const Admin = () => {
  const [gameStats, setGameStats] = useState({
    totalGamesPlayed: 15,
    totalCardsSold: 320,
    totalWinningsDistributed: 750.25,
    activePlayers: 12,
  });
  const [gameHistory, setGameHistory] = useState([
    { id: "game-0015", winner: "PlayerX", prize: 25.00, date: "2023-10-26 10:45 AM" },
    { id: "game-0014", winner: "PlayerY", prize: 18.75, date: "2023-10-26 10:15 AM" },
    { id: "game-0013", winner: "PlayerZ", prize: 30.00, date: "2023-10-26 09:50 AM" },
  ]);

  const handleStartNewGame = () => {
    showInfo("Simulating new game start... (Requires server-side implementation)");
  };

  const handleResetGameData = () => {
    if (window.confirm("Are you sure you want to reset all simulated game data? This cannot be undone.")) {
      setGameStats({
        totalGamesPlayed: 0,
        totalCardsSold: 0,
        totalWinningsDistributed: 0,
        activePlayers: 0,
      });
      setGameHistory([]);
      showSuccess("Simulated game data reset successfully!");
    }
  };

  // Helper for info toasts, as sonner's toast.info is not directly available
  const showInfo = (message: string) => {
    toast(message, {
      duration: 3000,
      position: "top-center",
    });
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-destructive/5 to-red-300/5">
      <Card className="w-full max-w-4xl text-center p-6 md:p-10 rounded-xl shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-destructive mb-4">
            Admin Panel 🔒
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            This is the secure administration area. Monitor game activity and manage settings.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 rounded-lg shadow-md border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-primary">Games Played</CardTitle>
                <Gamepad2 className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{gameStats.totalGamesPlayed}</div>
              </CardContent>
            </Card>
            <Card className="p-4 rounded-lg shadow-md border-accent/20 bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-accent-foreground">Cards Sold</CardTitle>
                <img src="/placeholder.svg" alt="Cards" className="h-5 w-5 text-accent-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{gameStats.totalCardsSold}</div>
              </CardContent>
            </Card>
            <Card className="p-4 rounded-lg shadow-md border-green-500/20 bg-green-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Winnings Distributed</CardTitle>
                <DollarSign className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">${gameStats.totalWinningsDistributed.toFixed(2)}</div>
              </CardContent>
            </Card>
            <Card className="p-4 rounded-lg shadow-md border-blue-500/20 bg-blue-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Active Players</CardTitle>
                <Users className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{gameStats.activePlayers}</div>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <Button
              onClick={handleStartNewGame}
              className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Start New Game
            </Button>
            <Button
              onClick={handleResetGameData}
              variant="outline"
              className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              <RefreshCcw className="h-5 w-5 mr-2" /> Reset Game Data
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="space-y-4 mt-8">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2 justify-center">
              <History className="h-6 w-6 text-primary" /> Recent Game History
            </h3>
            <div className="border rounded-lg overflow-hidden">
              {gameHistory.length > 0 ? (
                <ul className="divide-y divide-border">
                  {gameHistory.map((game) => (
                    <li key={game.id} className="flex justify-between items-center p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">Game ID: {game.id}</p>
                        <p className="text-sm text-muted-foreground">Winner: {game.winner}</p>
                        <p className="text-xs text-muted-foreground">{game.date}</p>
                      </div>
                      <div className="font-bold text-green-600">
                        +${game.prize.toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-muted-foreground">No game history available.</p>
              )}
            </div>
          </div>

          <div className="mt-8 text-sm text-muted-foreground">
            <p>Use with caution. All actions are logged. 🚨</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;