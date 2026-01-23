"use client";

import React from "react";
import { BingoCard, BingoCardNumber } from "@/utils/bingo";
import { cn } from "@/lib/utils";

interface BingoCardDisplayProps {
  card: BingoCard;
  calledNumbers: number[];
  cardId: string;
  isWinner?: boolean; // New prop
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
      isWinner && isDaubed && "bg-green-500 text-white shadow-2xl ring-4 ring-green-300" // Highlight winning cells
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
      isWinner && "border-green-500 ring-4 ring-green-300 shadow-2xl animate-pulse" // Highlight winning card container
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

export default BingoCardDisplay;