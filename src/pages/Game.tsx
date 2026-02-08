"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Users,
  Trophy,
  DollarSign,
  Wallet,
  ShoppingCart,
  Sparkles,
  Zap
} from "lucide-react";
import { BingoCard, generateBingoCard, generateCalledNumbers, checkBingo } from "@/utils/bingo";
import { showSuccess, showError } from "@/utils/toast";
import BingoCardDisplay from "@/components/BingoCardDisplay";
import NumberDrawAnimation from "@/components/NumberDrawAnimation";
import CalledNumbersBoard from "@/components/CalledNumbersBoard";
import TelegramLogin from "@/components/TelegramLogin";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface PurchasedCard {
  id: string;
  cardData: BingoCard;
  ownerId: number;
  ownerUsername?: string;
}

const cardPrices = [0.50, 1.00, 2.50, 5.00];

const Game = () => {
  const { user, isLoading: authLoading, refreshUser } = useAuth();

  // Game state
  const [selectedPrice, setSelectedPrice] = useState<number>(cardPrices[1]);
  const [numCardsToBuy, setNumCardsToBuy] = useState<number>(1);
  const [purchasedCards, setPurchasedCards] = useState<PurchasedCard[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentCalledNumber, setCurrentCalledNumber] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<"waiting" | "in_progress" | "completed">("waiting");
  const [isCallingNumbers, setIsCallingNumbers] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [prizePool, setPrizePool] = useState(0);
  const [shuffledNumbers, setShuffledNumbers] = useState<number[]>([]);
  const [balance, setBalance] = useState(100); // Demo balance

  // Simulated multiplayer data
  const [otherPlayers, setOtherPlayers] = useState([
    { id: 1, username: "CryptoKing", cards: 3 },
    { id: 2, username: "BingoMaster", cards: 5 },
    { id: 3, username: "LuckyCharm", cards: 2 },
  ]);

  // Initialize shuffled numbers
  useEffect(() => {
    setShuffledNumbers(generateCalledNumbers());
  }, []);

  // Auto-call numbers when game is in progress
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (gameStatus === "in_progress" && isCallingNumbers && !winnerId && !isAnimating) {
      interval = setInterval(() => {
        callNextNumber();
      }, 4000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gameStatus, isCallingNumbers, winnerId, isAnimating, calledNumbers.length]);

  const callNextNumber = useCallback(() => {
    if (calledNumbers.length >= 75 || winnerId || isAnimating) {
      if (calledNumbers.length >= 75) {
        showError("All numbers called! No winner this round.");
        setGameStatus("completed");
        setIsCallingNumbers(false);
      }
      return;
    }

    setIsAnimating(true);
    const nextNumber = shuffledNumbers[calledNumbers.length];
    setCurrentCalledNumber(nextNumber);

    // After animation completes
    setTimeout(() => {
      setCalledNumbers(prev => [...prev, nextNumber]);

      // Check all cards for bingo
      purchasedCards.forEach((pc) => {
        if (checkBingo(pc.cardData, [...calledNumbers, nextNumber])) {
          setWinnerId(pc.id);
          setGameStatus("completed");
          setIsCallingNumbers(false);

          const winAmount = prizePool * 0.9;
          if (pc.ownerId === user?.id) {
            setBalance(prev => prev + winAmount);
            showSuccess(`BINGO! You won $${winAmount.toFixed(2)}! Card ${pc.id.substring(0, 8)} is a winner!`);
          } else {
            showSuccess(`BINGO! ${pc.ownerUsername || "A player"} wins $${winAmount.toFixed(2)}!`);
          }
        }
      });

      setIsAnimating(false);
    }, 2500);
  }, [calledNumbers, shuffledNumbers, purchasedCards, prizePool, winnerId, isAnimating, user?.id]);

  const handleBuyCards = () => {
    if (gameStatus === "in_progress") {
      showError("Cannot buy cards while a game is in progress.");
      return;
    }

    const totalCost = selectedPrice * numCardsToBuy;
    if (balance < totalCost) {
      showError(`Insufficient balance! You need $${totalCost.toFixed(2)} but have $${balance.toFixed(2)}`);
      return;
    }

    if (numCardsToBuy > 0 && numCardsToBuy <= 10) {
      const newCards: PurchasedCard[] = [];
      for (let i = 0; i < numCardsToBuy; i++) {
        newCards.push({
          id: `card-${Date.now()}-${i}`,
          cardData: generateBingoCard(),
          ownerId: user?.id || 0,
          ownerUsername: user?.username || user?.firstName,
        });
      }
      setPurchasedCards(prev => [...prev, ...newCards]);
      setBalance(prev => prev - totalCost);
      setPrizePool(prev => prev + totalCost);
      showSuccess(`Purchased ${numCardsToBuy} card(s) for $${totalCost.toFixed(2)}!`);
    }
  };

  const handleStartGame = () => {
    if (purchasedCards.length === 0) {
      showError("Please buy at least one card to start a game.");
      return;
    }
    setGameStatus("in_progress");
    setCalledNumbers([]);
    setCurrentCalledNumber(null);
    setWinnerId(null);
    setShuffledNumbers(generateCalledNumbers());
    setIsCallingNumbers(true);
    showSuccess("Game started! Good luck!");
  };

  const handleNewGame = () => {
    setPurchasedCards([]);
    setCalledNumbers([]);
    setCurrentCalledNumber(null);
    setGameStatus("waiting");
    setIsCallingNumbers(false);
    setWinnerId(null);
    setPrizePool(0);
    setShuffledNumbers(generateCalledNumbers());
    showSuccess("New game initiated! Buy cards to play.");
  };

  const handleAddBalance = (amount: number) => {
    setBalance(prev => prev + amount);
    showSuccess(`Added $${amount.toFixed(2)} to your balance!`);
  };

  // Show login if not authenticated
  if (!authLoading && !user) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center p-4 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">DegenFamousBingo</h1>
            <p className="text-purple-200">Sign in to start playing!</p>
          </div>
          <TelegramLogin />
        </div>
      </div>
    );
  }

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with user info */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              <Zap className="w-8 h-8 text-yellow-400" />
              DegenFamousBingo
            </h1>
            <p className="text-purple-200">
              Welcome, <span className="text-yellow-400 font-semibold">{user?.firstName}</span>!
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-400" />
                <span className="text-lg font-bold text-green-400">${balance.toFixed(2)}</span>
              </div>
            </div>
            <Button
              onClick={() => handleAddBalance(50)}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <DollarSign className="w-4 h-4 mr-1" />
              Add Funds
            </Button>
          </div>
        </div>

        {/* Game status bar */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-slate-400">Status</p>
                  <Badge
                    className={cn(
                      "mt-1",
                      gameStatus === "waiting" && "bg-yellow-500",
                      gameStatus === "in_progress" && "bg-green-500 animate-pulse",
                      gameStatus === "completed" && "bg-slate-500"
                    )}
                  >
                    {gameStatus === "waiting" && "Waiting for players"}
                    {gameStatus === "in_progress" && "Game in progress!"}
                    {gameStatus === "completed" && "Game ended"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Prize Pool</p>
                  <p className="text-2xl font-black text-green-400">${prizePool.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Cards</p>
                  <p className="text-2xl font-black text-purple-400">{purchasedCards.length}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Numbers Called</p>
                  <p className="text-2xl font-black text-blue-400">{calledNumbers.length}/75</p>
                </div>
              </div>

              {gameStatus === "in_progress" && (
                <Progress
                  value={(calledNumbers.length / 75) * 100}
                  className="w-32 h-3 bg-slate-700"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main game area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Purchase cards */}
          <div className="space-y-6">
            {/* Buy cards */}
            <Card className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-purple-400" />
                  Buy Bingo Cards
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-purple-200">Card Price</Label>
                  <Select
                    onValueChange={(value) => setSelectedPrice(parseFloat(value))}
                    value={selectedPrice.toString()}
                    disabled={gameStatus === "in_progress"}
                  >
                    <SelectTrigger className="bg-slate-800 border-purple-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/50">
                      {cardPrices.map((price) => (
                        <SelectItem key={price} value={price.toString()} className="text-white">
                          ${price.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-purple-200">Number of Cards</Label>
                  <Select
                    onValueChange={(value) => setNumCardsToBuy(parseInt(value))}
                    value={numCardsToBuy.toString()}
                    disabled={gameStatus === "in_progress"}
                  >
                    <SelectTrigger className="bg-slate-800 border-purple-500/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-purple-500/50">
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => (
                        <SelectItem key={count} value={count.toString()} className="text-white">
                          {count} card{count > 1 ? "s" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/50">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total Cost</span>
                    <span className="text-white font-bold">
                      ${(selectedPrice * numCardsToBuy).toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={handleBuyCards}
                  disabled={gameStatus === "in_progress"}
                  className="w-full py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Buy Cards
                </Button>
              </CardContent>
            </Card>

            {/* Other players */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  Players in Game
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Current user */}
                  <div className="flex items-center justify-between p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.firstName?.[0]}
                      </div>
                      <span className="text-white font-medium">{user?.firstName} (You)</span>
                    </div>
                    <Badge className="bg-purple-500">{purchasedCards.length} cards</Badge>
                  </div>

                  {/* Simulated other players */}
                  {otherPlayers.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold">
                          {player.username[0]}
                        </div>
                        <span className="text-slate-300">{player.username}</span>
                      </div>
                      <Badge variant="outline" className="border-slate-500 text-slate-300">
                        {player.cards} cards
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center column - Number draw and game controls */}
          <div className="space-y-6">
            {/* Number draw animation */}
            <NumberDrawAnimation
              number={currentCalledNumber}
              isDrawing={isAnimating}
            />

            {/* Game controls */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  {gameStatus === "waiting" && (
                    <Button
                      onClick={handleStartGame}
                      disabled={purchasedCards.length === 0}
                      className="col-span-2 py-6 text-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Game
                    </Button>
                  )}

                  {gameStatus === "in_progress" && (
                    <>
                      <Button
                        onClick={() => setIsCallingNumbers(!isCallingNumbers)}
                        className={cn(
                          "py-4",
                          isCallingNumbers
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-500"
                        )}
                      >
                        {isCallingNumbers ? (
                          <>
                            <Pause className="w-4 h-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Resume
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={callNextNumber}
                        disabled={isAnimating || isCallingNumbers}
                        className="py-4 bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        <SkipForward className="w-4 h-4 mr-2" />
                        Call Next
                      </Button>
                    </>
                  )}

                  {gameStatus === "completed" && (
                    <Button
                      onClick={handleNewGame}
                      className="col-span-2 py-6 text-lg bg-gradient-to-r from-purple-500 to-pink-500"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      New Game
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Called numbers board */}
            {calledNumbers.length > 0 && (
              <CalledNumbersBoard calledNumbers={calledNumbers} />
            )}
          </div>

          {/* Right column - Your cards */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Your Bingo Cards
                </CardTitle>
              </CardHeader>
              <CardContent>
                {purchasedCards.length > 0 ? (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {purchasedCards.map((pc) => (
                      <BingoCardDisplay
                        key={pc.id}
                        card={pc.cardData}
                        calledNumbers={calledNumbers}
                        cardId={pc.id.substring(0, 8)}
                        isWinner={winnerId === pc.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No cards purchased yet</p>
                    <p className="text-sm text-slate-500">Buy cards to join the game!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Winner announcement */}
        {winnerId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <Card className="w-full max-w-md mx-4 bg-gradient-to-br from-yellow-500 to-orange-500 border-4 border-yellow-300 animate-bounce">
              <CardContent className="p-8 text-center">
                <div className="text-6xl mb-4">
                  {purchasedCards.find(c => c.id === winnerId)?.ownerId === user?.id ? (
                    "You Win!"
                  ) : (
                    <Trophy className="w-24 h-24 text-white mx-auto" />
                  )}
                </div>
                <h2 className="text-3xl font-black text-white mb-2">BINGO!</h2>
                <p className="text-xl text-yellow-100 mb-4">
                  {purchasedCards.find(c => c.id === winnerId)?.ownerId === user?.id
                    ? `You won $${(prizePool * 0.9).toFixed(2)}!`
                    : `${purchasedCards.find(c => c.id === winnerId)?.ownerUsername || "A player"} wins!`}
                </p>
                <Button
                  onClick={handleNewGame}
                  className="bg-white text-orange-600 hover:bg-yellow-100 font-bold"
                >
                  Play Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
