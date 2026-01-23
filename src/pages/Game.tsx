"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BingoCard, generateBingoCard, showSuccess, showError } from "@/utils/bingo";
import BingoCardDisplay from "@/components/BingoCardDisplay";

interface PurchasedCard {
  id: string;
  cardData: BingoCard;
}

const cardPrices = [0.50, 1.00, 2.50, 5.00];

const Game = () => {
  const [selectedPrice, setSelectedPrice] = useState<number>(cardPrices[0]);
  const [numCardsToBuy, setNumCardsToBuy] = useState<number>(1);
  const [purchasedCards, setPurchasedCards] = useState<PurchasedCard[]>([]);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]); // For simulation

  const handleBuyCards = () => {
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

  // Simulate a game for demonstration
  useEffect(() => {
    if (purchasedCards.length > 0) {
      const interval = setInterval(() => {
        // Simulate calling a new number
        const nextNumber = Math.floor(Math.random() * 75) + 1;
        setCalledNumbers((prev) => {
          if (!prev.includes(nextNumber)) {
            return [...prev, nextNumber];
          }
          return prev; // Don't add duplicates in this simple simulation
        });
      }, 3000); // Call a number every 3 seconds

      return () => clearInterval(interval);
    }
  }, [purchasedCards]);


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
              className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mt-4 sm:mt-0"
            >
              Buy {numCardsToBuy} Card(s) for ${(selectedPrice * numCardsToBuy).toFixed(2)} 💰
            </Button>
          </div>

          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
              Back to Home
            </Button>
          </Link>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Next game starts soon! Stay tuned for real-time updates. ⏳</p>
          </div>
        </CardContent>
      </Card>

      {purchasedCards.length > 0 && (
        <div className="w-full max-w-4xl mt-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-primary text-center mb-6">Your Bingo Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {purchasedCards.map((pc) => (
              <BingoCardDisplay key={pc.id} card={pc.cardData} calledNumbers={calledNumbers} cardId={pc.id} />
            ))}
          </div>
          <div className="text-center mt-8">
            <h3 className="text-2xl font-bold text-foreground">
              Called Numbers: <span className="text-primary">{calledNumbers.join(", ")}</span>
            </h3>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;