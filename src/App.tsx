"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner, toast } from "sonner"; // Using sonner toast
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DollarSign, User, Wallet, History, Trophy, Crown, ArrowLeft, Gamepad2, RefreshCcw, Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// --- Utility Functions (from src/lib/utils.ts) ---
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Toast Utility Functions (from src/utils/bingo.ts, replacing src/utils/toast.ts) ---
export const showSuccess = (message: string) => {
  toast.success(message);
};

export const showError = (message: string) => {
  toast.error(message);
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (toastId: string) => {
  toast.dismiss(toastId);
};

// --- Bingo Game Logic (from src/utils/bingo.ts) ---
export type BingoCardNumber = {
  value: number | "FREE";
  column: "B" | "I" | "N" | "G" | "O";
  isCalled: boolean;
};

export type BingoCard = BingoCardNumber[][];

const generateColumnNumbers = (min: number, max: number, count: number): number[] => {
  const numbers: number[] = [];
  while (numbers.length < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(num)) {
      numbers.push(num);
    }
  }
  return numbers.sort((a, b) => a - b);
};

export const generateBingoCard = (): BingoCard => {
  const card: BingoCard = [];

  const columns = {
    B: generateColumnNumbers(1, 15, 5),
    I: generateColumnNumbers(16, 30, 5),
    N: generateColumnNumbers(31, 45, 5),
    G: generateColumnNumbers(46, 60, 5),
    O: generateColumnNumbers(61, 75, 5),
  };

  const columnKeys: Array<"B" | "I" | "N" | "G" | "O"> = ["B", "I", "N", "G", "O"];

  for (let i = 0; i < 5; i++) {
    const row: BingoCardNumber[] = [];
    for (let j = 0; j < 5; j++) {
      const columnKey = columnKeys[j];
      let value: number | "FREE";

      if (i === 2 && j === 2) { // Center square is FREE
        value = "FREE";
      } else {
        value = columns[columnKey].shift()!;
      }

      row.push({
        value,
        column: columnKey,
        isCalled: false,
      });
    }
    card.push(row);
  }
  return card;
};

export const generateCalledNumbers = (): number[] => {
  const numbers: number[] = [];
  for (let i = 1; i <= 75; i++) {
    numbers.push(i);
  }
  // Shuffle the numbers to simulate random calls
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }
  return numbers;
};

export const checkBingo = (card: BingoCard, calledNumbers: number[]): boolean => {
  const isMarked = (cell: BingoCardNumber) =>
    cell.value === "FREE" || (typeof cell.value === "number" && calledNumbers.includes(cell.value));

  // Check rows
  for (let i = 0; i < 5; i++) {
    if (card[i].every(isMarked)) return true;
  }

  // Check columns
  for (let j = 0; j < 5; j++) {
    if (card.every(row => isMarked(row[j]))) return true;
  }

  // Check diagonals
  const diagonal1 = [card[0][0], card[1][1], card[2][2], card[3][3], card[4][4]];
  if (diagonal1.every(isMarked)) return true;

  const diagonal2 = [card[0][4], card[1][3], card[2][2], card[3][1], card[4][0]];
  if (diagonal2.every(isMarked)) return true;

  return false;
};

// --- MadeWithDyad Component (from src/components/made-with-dyad.tsx) ---
export const MadeWithDyad = () => {
  return (
    <div className="p-4 text-center">
      <a
        href="https://www.dyad.sh/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        Made with Dyad
      </a>
    </div>
  );
};

// --- Footer Component (from src/components/Footer.tsx) ---
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

// --- Header Component (from src/components/Header.tsx) ---
const Header = () => {
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
            <Link to="/profile">
              <Button variant="ghost" className="rounded-lg text-primary hover:bg-accent hover:text-primary">
                Profile
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button variant="ghost" className="rounded-lg text-primary hover:bg-accent hover:text-primary">
                <Trophy className="h-4 w-4 mr-1" /> Leaderboard
              </Button>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/profile" className="flex items-center space-x-1 bg-accent/20 px-3 py-1 rounded-full text-sm font-medium text-primary hover:bg-accent/40 transition-colors">
              <User className="h-4 w-4" />
              <span>{userName}</span>
            </Link>
            <Link to="/profile" className="flex items-center space-x-1 bg-accent/20 px-3 py-1 rounded-full text-sm font-medium text-primary hover:bg-accent/40 transition-colors">
              <DollarSign className="h-4 w-4" />
              <span>{walletBalance}</span>
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

// --- BingoCardDisplay Component (from src/components/BingoCardDisplay.tsx) ---
interface BingoCardDisplayProps {
  card: BingoCard;
  calledNumbers: number[];
  cardId: string;
  isWinner?: boolean;
}

const BingoCardDisplay: React.FC<BingoCardDisplayProps> = ({ card, calledNumbers, cardId, isWinner = false }) => {
  const getCellClasses = (cell: BingoCardNumber) => {
    const isDaubed = cell.value === "FREE" || (typeof cell.value === "number" && calledNumbers.includes(cell.value));
    return cn(
      "flex items-center justify-center p-2 md:p-3 text-lg md:text-xl font-bold border border-primary/20",
      "rounded-md transition-all duration-200 ease-in-out",
      isDaubed
        ? "bg-primary text-primary-foreground shadow-inner scale-105"
        : "bg-card text-foreground hover:bg-accent/20",
      cell.value === "FREE" && "bg-primary/80 text-primary-foreground",
      isWinner && isDaubed && "bg-green-500 text-white shadow-2xl ring-4 ring-green-300"
    );
  };

  const getNumberDisplay = (cell: BingoCardNumber) => {
    const isDaubed = cell.value === "FREE" || (typeof cell.value === "number" && calledNumbers.includes(cell.value));
    if (cell.value === "FREE") {
      return "✨ FREE ✨";
    }
    return isDaubed ? `✅ ${cell.value}` : cell.value;
  };

  return (
    <div className={cn(
      "bg-gradient-to-br from-primary/10 to-accent/10 p-4 rounded-xl shadow-lg border border-primary/30",
      isWinner && "border-green-500 ring-4 ring-green-300 shadow-2xl animate-pulse"
    )}>
      <h3 className="text-center text-xl font-semibold text-primary mb-4">Card ID: {cardId}</h3>
      <div className="grid grid-cols-5 gap-1 md:gap-2">
        {/* Header Row */}
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className="flex items-center justify-center p-2 md:p-3 text-lg md:text-xl font-extrabold bg-primary text-primary-foreground rounded-md shadow-sm"
          >
            {letter}
          </div>
        ))}
        {/* Bingo Numbers */}
        {card.flat().map((cell, index) => (
          <div key={index} className={getCellClasses(cell)}>
            {getNumberDisplay(cell)}
          </div>
        ))}
      </div>
    </div>
  );
};

// --- NotFound Page (from src/pages/NotFound.tsx) ---
const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
        <a href="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </a>
      </div>
    </div>
  );
};

// --- Index Page (from src/pages/Index.tsx) ---
const Index = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
      <Card className="w-full max-w-2xl text-center p-6 md:p-10 rounded-xl shadow-lg border-primary/20">
        <CardHeader>
          <CardTitle className="text-4xl md:text-5xl font-extrabold text-primary mb-4 animate-pulse">
            Welcome to Bingo Blitz! 🎉
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            Get ready for an electrifying bingo experience! Buy your cards, join a game, and shout BINGO!
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

// --- Profile Page (from src/pages/Profile.tsx) ---
const Profile = () => {
  const userId = "telegram_user_12345";
  const userName = "BingoPlayer123";
  const walletBalance = "100.50 USDT";
  const transactionHistory = [
    { id: "tx1", type: "Purchase", amount: "-$1.00", date: "2023-10-26 10:30 AM", status: "Completed" },
    { id: "tx2", type: "Deposit", amount: "+$50.00", date: "2023-10-25 09:00 AM", status: "Completed" },
    { id: "tx3", type: "Win", amount: "+$15.00", date: "2023-10-24 03:15 PM", status: "Completed" },
    { id: "tx4", type: "Purchase", amount: "-$2.50", date: "2023-10-24 03:00 PM", status: "Completed" },
  ];

  const handleDeposit = () => {
    alert("Simulating deposit... (Integrate Cwallet API here)");
  };

  const handleWithdraw = () => {
    alert("Simulating withdrawal... (Integrate Cwallet API here)");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
      <Card className="w-full max-w-3xl p-6 md:p-10 rounded-xl shadow-lg border-accent/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
            My Profile & Wallet 👤💰
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <User className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">{userName}</h3>
            <p className="text-md text-muted-foreground">Telegram ID: {userId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 rounded-lg shadow-md border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-primary">Wallet Balance</CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{walletBalance}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for games</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleDeposit} className="flex-1 rounded-full bg-green-500 hover:bg-green-600 text-white">
                    Deposit
                  </Button>
                  <Button onClick={handleWithdraw} variant="outline" className="flex-1 rounded-full border-green-500 text-green-500 hover:bg-green-500/10">
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 rounded-lg shadow-md border-accent/20 bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-accent-foreground">Loyalty Rewards</CardTitle>
                <img src="/placeholder.svg" alt="Trophy" className="h-5 w-5 text-accent-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">500 Points</div>
                <p className="text-xs text-muted-foreground mt-1">Earned from playing</p>
                <Button className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4">
                  Redeem Rewards
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6 text-primary" /> Transaction History
            </h3>
            <div className="border rounded-lg overflow-hidden">
              {transactionHistory.length > 0 ? (
                <ul className="divide-y divide-border">
                  {transactionHistory.map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                      <div className={cn(
                        "font-bold",
                        tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                      )}>
                        {tx.amount}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-muted-foreground">No transactions yet.</p>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Admin Page (from src/pages/Admin.tsx) ---
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
    toast.info("Simulating new game start... (Requires server-side implementation)", {
      duration: 3000,
    });
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
      toast.success("Simulated game data reset successfully!", {
        duration: 3000,
      });
    }
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

// --- Leaderboard Page (from src/pages/Leaderboard.tsx) ---
const Leaderboard = () => {
  const leaderboardData = [
    { id: "1", name: "CryptoKing", score: 15000, rank: 1, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CryptoKing" },
    { id: "2", name: "BingoMaster", score: 12500, rank: 2, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BingoMaster" },
    { id: "3", name: "LuckyCharm", score: 10000, rank: 3, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=LuckyCharm" },
    { id: "4", name: "WinnerWilly", score: 8500, rank: 4, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=WinnerWilly" },
    { id: "5", name: "CardShark", score: 7200, rank: 5, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=CardShark" },
    { id: "6", name: "HighRoller", score: 6000, rank: 6, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=HighRoller" },
    { id: "7", name: "QuickDraw", score: 5500, rank: 7, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=QuickDraw" },
    { id: "8", name: "NumberNinja", score: 4800, rank: 8, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=NumberNinja" },
    { id: "9", name: "BingoBoss", score: 4100, rank: 9, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=BingoBoss" },
    { id: "10", name: "GameChanger", score: 3500, rank: 10, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=GameChanger" },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-4xl p-6 md:p-10 rounded-xl shadow-lg border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary mb-4 flex items-center justify-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" /> Global Leaderboard <Trophy className="h-8 w-8 text-yellow-500" />
          </CardTitle>
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            See who's dominating the Bingo Blitz arena!
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="overflow-x-auto rounded-lg border border-primary/20 shadow-md">
            <Table>
              <TableHeader className="bg-primary/10">
                <TableRow>
                  <TableHead className="w-[80px] text-center text-primary font-bold">Rank</TableHead>
                  <TableHead className="text-primary font-bold">Player</TableHead>
                  <TableHead className="text-right text-primary font-bold">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((player) => (
                  <TableRow key={player.id} className={cn(
                    "hover:bg-accent/10 transition-colors",
                    player.rank <= 3 && "bg-yellow-500/5 hover:bg-yellow-500/10"
                  )}>
                    <TableCell className="font-medium text-center">
                      {player.rank === 1 && <Crown className="h-5 w-5 text-yellow-500 inline-block mr-1" />}
                      {player.rank}
                    </TableCell>
                    <TableCell className="flex items-center gap-3 py-3">
                      <Avatar className="h-9 w-9 border-2 border-primary/30">
                        <AvatarImage src={player.avatar} alt={player.name} />
                        <AvatarFallback>{player.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="font-semibold text-foreground">{player.name}</span>
                      {player.rank === 1 && <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/50">Champion</Badge>}
                    </TableCell>
                    <TableCell className="text-right font-bold text-primary">${player.score.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// --- Game Page (from src/pages/Game.tsx) ---
interface PurchasedCard {
  id: string;
  cardData: BingoCard;
}

const cardPrices = [0.50, 1.00, 2.50, 5.00];
const allPossibleNumbers = generateCalledNumbers();

const Game = () => {
  const [selectedPrice, setSelectedPrice] = useState<number>(cardPrices[0]);
  const [numCardsToBuy, setNumCardsToBuy] = useState<number>(1);
  const [purchasedCards, setPurchasedCards] = useState<PurchasedCard[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentCalledNumber, setCurrentCalledNumber] = useState<number | null>(null);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [isCallingNumbers, setIsCallingNumbers] = useState<boolean>(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const calledNumbersIndexRef = useRef(0);
  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateCardDaubStatus = useCallback((number: number) => {
    setPurchasedCards(prevCards =>
      prevCards.map(pc => {
        const newCardData = pc.cardData.map(row =>
          row.map(cell => {
            if (typeof cell.value === "number" && cell.value === number) {
              return { ...cell, isCalled: true };
            }
            return cell;
          })
        );
        return { ...pc, cardData: newCardData };
      })
    );
  }, []);

  const callNextNumber = useCallback(() => {
    if (calledNumbersIndexRef.current >= allPossibleNumbers.length) {
      toast.warning("All numbers called! No winner this round. 😔", {
        duration: 5000,
        position: "top-center",
      });
      setGameStarted(false);
      setIsCallingNumbers(false);
      return;
    }

    const nextNumber = allPossibleNumbers[calledNumbersIndexRef.current];
    setCurrentCalledNumber(nextNumber);
    setCalledNumbers((prev) => [...prev, nextNumber]);
    updateCardDaubStatus(nextNumber);
    calledNumbersIndexRef.current++;

    toast.info(`Number called: ${nextNumber}! 📣`, {
      duration: 2500,
      position: "top-center",
    });

    purchasedCards.forEach((pc) => {
      if (checkBingo(pc.cardData, [...calledNumbers, nextNumber])) {
        setWinnerId(pc.id);
        setGameStarted(false);
        setIsCallingNumbers(false);
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = null;
        }
        toast.success(`BINGO! Card ${pc.id} is a winner! 🎉`, {
          duration: 5000,
          position: "top-center",
        });
      }
    });
  }, [purchasedCards, calledNumbers, updateCardDaubStatus]);

  useEffect(() => {
    if (gameStarted && isCallingNumbers && !winnerId) {
      gameIntervalRef.current = setInterval(callNextNumber, 3000);
    } else if (!isCallingNumbers && gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }

    return () => {
      if (gameIntervalRef.current) {
        clearInterval(gameIntervalRef.current);
      }
    };
  }, [gameStarted, isCallingNumbers, winnerId, callNextNumber]);

  const handleBuyCards = () => {
    if (gameStarted) {
      showError("Cannot buy cards while a game is in progress.");
      return;
    }
    if (numCardsToBuy > 0 && numCardsToBuy <= 20) {
      const newCards: PurchasedCard[] = [];
      for (let i = 0; i < numCardsToBuy; i++) {
        newCards.push({
          id: `card-${Date.now()}-${i}`,
          cardData: generateBingoCard(),
        });
      }
      setPurchasedCards((prev) => [...prev, ...newCards]);
      showSuccess(`Successfully purchased ${numCardsToBuy} card(s) for $${(selectedPrice * numCardsToBuy).toFixed(2)}!`);
    } else {
      showError("Please select between 1 and 20 cards.");
    }
  };

  const handleStartGame = () => {
    if (purchasedCards.length === 0) {
      showError("Please buy at least one card to start a game.");
      return;
    }
    setGameStarted(true);
    setCalledNumbers([]);
    setCurrentCalledNumber(null);
    setWinnerId(null);
    calledNumbersIndexRef.current = 0;
    setIsCallingNumbers(true);
    toast.info("Game started! Good luck! 🍀");
  };

  const handlePauseCalling = () => {
    setIsCallingNumbers(false);
    toast.info("Number calling paused.");
  };

  const handleResumeCalling = () => {
    setIsCallingNumbers(true);
    toast.info("Number calling resumed.");
  };

  const handleManualCall = () => {
    if (gameStarted && !winnerId) {
      callNextNumber();
    } else if (!gameStarted) {
      showError("Please start the game first.");
    } else if (winnerId) {
      showError("Game has a winner. Please start a new game.");
    }
  };

  const handleNewGame = () => {
    if (gameIntervalRef.current) {
      clearInterval(gameIntervalRef.current);
      gameIntervalRef.current = null;
    }
    setPurchasedCards([]);
    setCalledNumbers([]);
    setCurrentCalledNumber(null);
    setGameStarted(false);
    setIsCallingNumbers(false);
    setWinnerId(null);
    calledNumbersIndexRef.current = 0;
    toast.success("New game initiated! All previous game data cleared.");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
      <Card className="w-full max-w-4xl text-center p-6 md:p-10 rounded-xl shadow-lg border-primary/20 mb-8">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
            Bingo Game Lobby 🎲
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            Welcome to the game! Here you can buy cards and join an upcoming bingo round.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 items-center">
            <div className="flex flex-col space-y-2">
              <Label htmlFor="card-price" className="text-lg text-primary font-semibold">Card Price:</Label>
              <Select
                onValueChange={(value) => setSelectedPrice(parseFloat(value))}
                defaultValue={selectedPrice.toString()}
                disabled={gameStarted}
              >
                <SelectTrigger id="card-price" className="w-[180px] rounded-full border-primary/50 text-primary">
                  <SelectValue placeholder="Select Price" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/50">
                  {cardPrices.map((price) => (
                    <SelectItem key={price} value={price.toString()} className="rounded-lg">
                      ${price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-2">
              <Label htmlFor="num-cards" className="text-lg text-primary font-semibold">Number of Cards:</Label>
              <Select
                onValueChange={(value) => setNumCardsToBuy(parseInt(value))}
                defaultValue={numCardsToBuy.toString()}
                disabled={gameStarted}
              >
                <SelectTrigger id="num-cards" className="w-[180px] rounded-full border-primary/50 text-primary">
                  <SelectValue placeholder="Select Quantity" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/50">
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((count) => (
                    <SelectItem key={count} value={count.toString()} className="rounded-lg">
                      {count}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBuyCards}
              disabled={gameStarted}
              className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-4 sm:mt-0"
            >
              Buy {numCardsToBuy} Card(s) for ${(selectedPrice * numCardsToBuy).toFixed(2)} 💰
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            {!gameStarted ? (
              <Button
                onClick={handleStartGame}
                disabled={purchasedCards.length === 0}
                className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              >
                Start Game (Admin Sim) ▶️
              </Button>
            ) : (
              <>
                {isCallingNumbers ? (
                  <Button
                    onClick={handlePauseCalling}
                    className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <Pause className="h-5 w-5 mr-2" /> Pause Calling
                  </Button>
                ) : (
                  <Button
                    onClick={handleResumeCalling}
                    disabled={winnerId !== null}
                    className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    <Play className="h-5 w-5 mr-2" /> Resume Calling
                  </Button>
                )}
                <Button
                  onClick={handleManualCall}
                  disabled={isCallingNumbers || winnerId !== null}
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-blue-500 text-blue-500 hover:bg-blue-500/10 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <SkipForward className="h-5 w-5 mr-2" /> Call Next Number
                </Button>
                <Button
                  onClick={handleNewGame}
                  variant="outline"
                  className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-red-500 text-red-500 hover:bg-red-500/10 transition-all duration-300 ease-in-out transform hover:scale-105"
                >
                  <RotateCcw className="h-5 w-5 mr-2" /> New Game
                </Button>
              </>
            )}
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Next game starts soon! Stay tuned for real-time updates. ⏳</p>
          </div>
        </CardContent>
      </Card>

      {gameStarted && currentCalledNumber !== null && (
        <div className="w-full max-w-4xl mt-8 text-center p-6 rounded-xl shadow-lg border-accent/30 bg-accent/10 animate-pulse">
          <h2 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">
            Calling: <span className="text-destructive">{currentCalledNumber}</span>! 🔔
          </h2>
          <p className="text-lg text-muted-foreground">Numbers called so far: {calledNumbers.join(", ")}</p>
        </div>
      )}

      {winnerId && (
        <div className="w-full max-w-4xl mt-8 text-center p-6 rounded-xl shadow-lg border-green-500/50 bg-green-500/10 animate-bounce">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-600 mb-2">
            BINGO! 🎉 Winner: Card {winnerId}!
          </h2>
          <p className="text-xl text-foreground">Congratulations! Prize distributed. 🏆</p>
        </div>
      )}

      {purchasedCards.length > 0 && (
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-primary text-center mb-6">Your Bingo Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchasedCards.map((pc) => (
              <BingoCardDisplay
                key={pc.id}
                card={pc.cardData}
                calledNumbers={calledNumbers}
                cardId={pc.id}
                isWinner={winnerId === pc.id}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game" element={<Game />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;