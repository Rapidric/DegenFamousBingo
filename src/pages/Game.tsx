"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Play, Pause, SkipForward, RotateCcw } from "lucide-react";
import { BingoCard, generateBingoCard, generateCalledNumbers, checkBingo } from "@/utils/bingo";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import BingoCardDisplay from "@/components/BingoCardDisplay";
import { cn } from "@/lib/utils";

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
      showError("All numbers called! No winner this round. 😔");
      setGameStarted(false);
      setIsCallingNumbers(false);
      return;
    }

    const nextNumber = allPossibleNumbers[calledNumbersIndexRef.current];
    setCurrentCalledNumber(nextNumber);
    setCalledNumbers((prev) => [...prev, nextNumber]);
    updateCardDaubStatus(nextNumber);
    calledNumbersIndexRef.current++;

    showSuccess(`Number called: ${nextNumber}! 📣`);

    purchasedCards.forEach((pc) => {
      if (checkBingo(pc.cardData, [...calledNumbers, nextNumber])) {
        setWinnerId(pc.id);
        setGameStarted(false);
        setIsCallingNumbers(false);
        if (gameIntervalRef.current) {
          clearInterval(gameIntervalRef.current);
          gameIntervalRef.current = null;
        }
        showSuccess(`BINGO! Card ${pc.id} is a winner! 🎉`);
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
    showSuccess("Game started! Good luck! 🍀");
  };

  const handlePauseCalling = () => {
    setIsCallingNumbers(false);
    showSuccess("Number calling paused.");
  };

  const handleResumeCalling = () => {
    setIsCallingNumbers(true);
    showSuccess("Number calling resumed.");
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
    showSuccess("New game initiated! All previous game data cleared.");
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

export default Game;