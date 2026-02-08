"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DollarSign,
  Gamepad2,
  RefreshCcw,
  History,
  Users,
  Play,
  Pause,
  SkipForward,
  Plus,
  Shield,
  TrendingUp,
  Trophy,
  Zap,
  Settings,
  BarChart3,
} from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import TelegramLogin from "@/components/TelegramLogin";
import NumberDrawAnimation from "@/components/NumberDrawAnimation";
import CalledNumbersBoard from "@/components/CalledNumbersBoard";
import {
  adminApi,
  gameApi,
  BingoGame,
  GameStats,
  GameHistoryItem,
  User,
} from "@/lib/api";

const Admin = () => {
  const { user, isLoading: authLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [currentGame, setCurrentGame] = useState<BingoGame | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalCardsSold: 0,
    totalWinningsDistributed: 0,
    activePlayers: 0,
    activeGames: 0,
  });
  const [gameHistory, setGameHistory] = useState<GameHistoryItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newGamePrice, setNewGamePrice] = useState("1.00");
  const [isCallingNumber, setIsCallingNumber] = useState(false);
  const [lastCalledNumber, setLastCalledNumber] = useState<number | null>(null);
  const [isAutoCall, setIsAutoCall] = useState(false);
  const [autoCallInterval, setAutoCallInterval] = useState<NodeJS.Timeout | null>(null);

  // Demo mode state for testing without backend
  const [demoMode, setDemoMode] = useState(true);
  const [demoGame, setDemoGame] = useState<BingoGame | null>(null);
  const [demoNumbers, setDemoNumbers] = useState<number[]>([]);

  const fetchData = useCallback(async () => {
    if (demoMode) return;

    try {
      const [statsRes, historyRes, gameRes, usersRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getHistory(),
        gameApi.getCurrentGame(),
        adminApi.getUsers(),
      ]);

      setGameStats(statsRes.stats);
      setGameHistory(historyRes.history);
      setCurrentGame(gameRes.game);
      setUsers(usersRes.users);
    } catch (error) {
      console.error("Failed to fetch admin data:", error);
    }
  }, [demoMode]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchData();
    }
  }, [authLoading, user, fetchData]);

  // Generate shuffled numbers for demo
  const generateShuffledNumbers = () => {
    const numbers: number[] = [];
    for (let i = 1; i <= 75; i++) {
      numbers.push(i);
    }
    for (let i = numbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    return numbers;
  };

  const handleCreateGame = async () => {
    const price = parseFloat(newGamePrice);
    if (isNaN(price) || price <= 0) {
      showError("Please enter a valid price");
      return;
    }

    if (demoMode) {
      const shuffled = generateShuffledNumbers();
      setDemoNumbers(shuffled);
      setDemoGame({
        id: `demo-${Date.now()}`,
        status: "waiting",
        cards: [],
        calledNumbers: [],
        currentNumber: null,
        winnerId: null,
        winnerUserId: null,
        prizePool: 0,
        cardPrice: price,
        createdAt: new Date().toISOString(),
        startedAt: null,
        endedAt: null,
      });
      setGameStats(prev => ({ ...prev, activeGames: 1 }));
      showSuccess(`Demo game created with $${price.toFixed(2)} card price!`);
      return;
    }

    try {
      const { game } = await adminApi.createGame(price);
      setCurrentGame(game);
      showSuccess("New game created successfully!");
    } catch (error) {
      showError("Failed to create game");
    }
  };

  const handleStartGame = async () => {
    const game = demoMode ? demoGame : currentGame;
    if (!game) return;

    if (demoMode) {
      setDemoGame(prev => prev ? { ...prev, status: "in_progress", startedAt: new Date().toISOString() } : null);
      showSuccess("Demo game started! Begin calling numbers.");
      return;
    }

    try {
      const { game: startedGame } = await adminApi.startGame(game.id);
      setCurrentGame(startedGame);
      showSuccess("Game started!");
    } catch (error) {
      showError("Failed to start game");
    }
  };

  const handleCallNumber = async () => {
    const game = demoMode ? demoGame : currentGame;
    if (!game || game.status !== "in_progress") return;

    setIsCallingNumber(true);

    if (demoMode) {
      const nextIndex = demoGame?.calledNumbers.length || 0;
      if (nextIndex >= 75) {
        showError("All numbers have been called!");
        setIsCallingNumber(false);
        return;
      }

      const nextNumber = demoNumbers[nextIndex];
      setLastCalledNumber(nextNumber);

      setTimeout(() => {
        setDemoGame(prev => prev ? {
          ...prev,
          calledNumbers: [...prev.calledNumbers, nextNumber],
          currentNumber: nextNumber,
        } : null);
        setIsCallingNumber(false);
      }, 2000);
      return;
    }

    try {
      const result = await adminApi.callNumber(game.id);
      setLastCalledNumber(result.number);
      setCurrentGame(result.game);

      if (result.winner) {
        showSuccess(`BINGO! Winner: ${result.winner.ownerUsername || "Unknown"}`);
        setIsAutoCall(false);
        if (autoCallInterval) {
          clearInterval(autoCallInterval);
          setAutoCallInterval(null);
        }
      }
    } catch (error) {
      showError("Failed to call number");
    } finally {
      setTimeout(() => setIsCallingNumber(false), 2000);
    }
  };

  const toggleAutoCall = () => {
    if (isAutoCall) {
      if (autoCallInterval) {
        clearInterval(autoCallInterval);
        setAutoCallInterval(null);
      }
      setIsAutoCall(false);
      showSuccess("Auto-call paused");
    } else {
      setIsAutoCall(true);
      const interval = setInterval(() => {
        handleCallNumber();
      }, 5000);
      setAutoCallInterval(interval);
      showSuccess("Auto-call started (every 5 seconds)");
    }
  };

  const handleEndGame = async () => {
    const game = demoMode ? demoGame : currentGame;
    if (!game) return;

    if (demoMode) {
      setDemoGame(null);
      setDemoNumbers([]);
      setLastCalledNumber(null);
      setGameStats(prev => ({
        ...prev,
        activeGames: 0,
        totalGamesPlayed: prev.totalGamesPlayed + 1,
      }));
      showSuccess("Demo game ended");
      return;
    }

    try {
      await adminApi.endGame(game.id);
      setCurrentGame(null);
      fetchData();
      showSuccess("Game ended");
    } catch (error) {
      showError("Failed to end game");
    }
  };

  // Clean up auto-call on unmount
  useEffect(() => {
    return () => {
      if (autoCallInterval) {
        clearInterval(autoCallInterval);
      }
    };
  }, [autoCallInterval]);

  const activeGame = demoMode ? demoGame : currentGame;

  // Show login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-red-300 mb-4">
              <Shield className="w-5 h-5" />
              Admin Access Required
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-slate-400">Please sign in to access admin features</p>
          </div>
          <TelegramLogin />
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-orange-500">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-white">
                Admin Dashboard
              </h1>
            </div>
            <p className="text-slate-400">
              Welcome back, <span className="text-purple-400 font-semibold">{user?.firstName}</span>!
              {demoMode && (
                <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">
                  Demo Mode
                </Badge>
              )}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setDemoMode(!demoMode)}
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              {demoMode ? "Connect to Server" : "Use Demo Mode"}
            </Button>
            <Link to="/game">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                <Gamepad2 className="w-4 h-4 mr-2" />
                View Game
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-red-200">Games Played</CardTitle>
              <Gamepad2 className="h-5 w-5 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{gameStats.totalGamesPlayed}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-orange-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-orange-200">Cards Sold</CardTitle>
              <BarChart3 className="h-5 w-5 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{gameStats.totalCardsSold}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-green-200">Winnings Paid</CardTitle>
              <DollarSign className="h-5 w-5 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">
                ${gameStats.totalWinningsDistributed.toFixed(2)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-bl-full" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-blue-200">Active Players</CardTitle>
              <Users className="h-5 w-5 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-white">{gameStats.activePlayers}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="game" className="w-full">
          <TabsList className="bg-slate-800/50 border border-slate-700 p-1">
            <TabsTrigger value="game" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Zap className="w-4 h-4 mr-2" />
              Game Control
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <History className="w-4 h-4 mr-2" />
              History
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-purple-500 data-[state=active]:text-white">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Game Control Tab */}
          <TabsContent value="game" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Game Controls */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-purple-400" />
                    Game Controls
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!activeGame ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                        <Label htmlFor="cardPrice" className="text-slate-300">Card Price ($)</Label>
                        <Input
                          id="cardPrice"
                          type="number"
                          step="0.50"
                          min="0.50"
                          value={newGamePrice}
                          onChange={(e) => setNewGamePrice(e.target.value)}
                          className="mt-2 bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <Button
                        onClick={handleCreateGame}
                        className="w-full py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Game
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Game Status */}
                      <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-slate-300">Status</span>
                          <Badge
                            className={cn(
                              activeGame.status === "waiting" && "bg-yellow-500",
                              activeGame.status === "in_progress" && "bg-green-500",
                              activeGame.status === "completed" && "bg-slate-500"
                            )}
                          >
                            {activeGame.status.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Card Price</span>
                            <p className="text-white font-bold">${activeGame.cardPrice.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Prize Pool</span>
                            <p className="text-green-400 font-bold">${activeGame.prizePool.toFixed(2)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Total Cards</span>
                            <p className="text-white font-bold">{activeGame.cards.length}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Numbers Called</span>
                            <p className="text-white font-bold">{activeGame.calledNumbers.length}/75</p>
                          </div>
                        </div>
                      </div>

                      {/* Control Buttons */}
                      <div className="grid grid-cols-2 gap-3">
                        {activeGame.status === "waiting" && (
                          <Button
                            onClick={handleStartGame}
                            disabled={activeGame.cards.length === 0 && !demoMode}
                            className="col-span-2 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                          >
                            <Play className="w-5 h-5 mr-2" />
                            Start Game
                          </Button>
                        )}

                        {activeGame.status === "in_progress" && (
                          <>
                            <Button
                              onClick={handleCallNumber}
                              disabled={isCallingNumber}
                              className="py-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                            >
                              <SkipForward className="w-5 h-5 mr-2" />
                              Call Number
                            </Button>
                            <Button
                              onClick={toggleAutoCall}
                              className={cn(
                                "py-6",
                                isAutoCall
                                  ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                  : "bg-gradient-to-r from-purple-500 to-pink-500"
                              )}
                            >
                              {isAutoCall ? (
                                <>
                                  <Pause className="w-5 h-5 mr-2" />
                                  Pause Auto
                                </>
                              ) : (
                                <>
                                  <Play className="w-5 h-5 mr-2" />
                                  Auto Call
                                </>
                              )}
                            </Button>
                          </>
                        )}

                        <Button
                          onClick={handleEndGame}
                          variant="destructive"
                          className="col-span-2 py-4"
                        >
                          <RefreshCcw className="w-4 h-4 mr-2" />
                          End Game
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Number Draw Animation */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    Number Drawing
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center min-h-[300px]">
                  <NumberDrawAnimation
                    number={lastCalledNumber}
                    isDrawing={isCallingNumber}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Called Numbers Board */}
            {activeGame && activeGame.calledNumbers.length > 0 && (
              <div className="mt-6">
                <CalledNumbersBoard calledNumbers={activeGame.calledNumbers} />
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Recent Game History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {gameHistory.length > 0 ? (
                  <div className="space-y-3">
                    {gameHistory.map((game) => (
                      <div
                        key={game.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600 hover:border-purple-500/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500">
                            <Trophy className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-white">Game #{game.id}</p>
                            <p className="text-sm text-slate-400">Winner: @{game.winner}</p>
                            <p className="text-xs text-slate-500">{game.date}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">+${game.prize.toFixed(2)}</p>
                          <p className="text-xs text-slate-400">{game.totalPlayers} players</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No game history yet</p>
                    <p className="text-sm text-slate-500">Completed games will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-3">
                    {users.map((u) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-4 rounded-xl bg-slate-700/50 border border-slate-600"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            {u.firstName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{u.firstName}</p>
                            <p className="text-sm text-slate-400">@{u.username || "unknown"}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {u.isAdmin && (
                            <Badge className="bg-red-500">Admin</Badge>
                          )}
                          <div className="text-right">
                            <p className="font-bold text-green-400">${u.balance.toFixed(2)}</p>
                            <p className="text-xs text-slate-400">Balance</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No users registered yet</p>
                    <p className="text-sm text-slate-500">Users will appear when they join via Telegram</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="mt-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  Bot Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                    <h3 className="font-semibold text-white mb-2">Telegram Bot</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Configure your Telegram bot settings in the server .env file
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bot Token</span>
                        <span className="text-green-400">Configured</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Admin IDs</span>
                        <span className="text-slate-300">{user?.id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-700/50 border border-slate-600">
                    <h3 className="font-semibold text-white mb-2">CWallet Integration</h3>
                    <p className="text-sm text-slate-400 mb-4">
                      Payment processing via CWallet
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Status</span>
                        <Badge className="bg-yellow-500">Demo Mode</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Supported Currency</span>
                        <span className="text-slate-300">USDT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
