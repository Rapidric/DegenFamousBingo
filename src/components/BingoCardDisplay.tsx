"use client";

import React from "react";
import { BingoCard, BingoCardNumber } from "@/utils/bingo";
import { cn } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface BingoCardDisplayProps {
  card: BingoCard;
  calledNumbers: number[];
  cardId: string;
  isWinner?: boolean;
}

const getColumnColor = (column: string, isDaubed: boolean): string => {
  if (!isDaubed) return "bg-slate-700/50 text-slate-300";

  switch (column) {
    case "B":
      return "bg-gradient-to-br from-red-500 to-pink-500 text-white";
    case "I":
      return "bg-gradient-to-br from-orange-500 to-yellow-500 text-white";
    case "N":
      return "bg-gradient-to-br from-green-500 to-emerald-500 text-white";
    case "G":
      return "bg-gradient-to-br from-blue-500 to-cyan-500 text-white";
    case "O":
      return "bg-gradient-to-br from-purple-500 to-violet-500 text-white";
    default:
      return "bg-slate-600 text-white";
  }
};

const getHeaderColor = (letter: string): string => {
  switch (letter) {
    case "B":
      return "bg-gradient-to-br from-red-500 to-pink-600";
    case "I":
      return "bg-gradient-to-br from-orange-500 to-yellow-500";
    case "N":
      return "bg-gradient-to-br from-green-500 to-emerald-600";
    case "G":
      return "bg-gradient-to-br from-blue-500 to-cyan-600";
    case "O":
      return "bg-gradient-to-br from-purple-500 to-violet-600";
    default:
      return "bg-slate-600";
  }
};

const BingoCardDisplay: React.FC<BingoCardDisplayProps> = ({
  card,
  calledNumbers,
  cardId,
  isWinner = false,
}) => {
  const getCellClasses = (cell: BingoCardNumber) => {
    const isDaubed =
      cell.value === "FREE" ||
      (typeof cell.value === "number" && calledNumbers.includes(cell.value));

    return cn(
      "flex items-center justify-center p-1 md:p-2 text-sm md:text-base font-bold",
      "rounded-lg transition-all duration-300 ease-out",
      "aspect-square",
      isDaubed
        ? cn(
            getColumnColor(cell.column, true),
            "shadow-lg transform scale-105",
            isWinner && "ring-2 ring-yellow-400 ring-offset-1 ring-offset-slate-900"
          )
        : "bg-slate-700/50 text-slate-400 hover:bg-slate-700",
      cell.value === "FREE" && "bg-gradient-to-br from-yellow-500 to-orange-500 text-white"
    );
  };

  const getNumberDisplay = (cell: BingoCardNumber) => {
    const isDaubed =
      cell.value === "FREE" ||
      (typeof cell.value === "number" && calledNumbers.includes(cell.value));

    if (cell.value === "FREE") {
      return (
        <span className="text-xs md:text-sm font-black">FREE</span>
      );
    }
    return (
      <span className={cn(isDaubed && "drop-shadow-md")}>
        {cell.value}
      </span>
    );
  };

  return (
    <div
      className={cn(
        "p-3 md:p-4 rounded-2xl transition-all duration-300",
        "bg-gradient-to-br from-slate-800 to-slate-900",
        "border-2",
        isWinner
          ? "border-yellow-400 shadow-2xl shadow-yellow-500/30 animate-pulse"
          : "border-slate-700 hover:border-purple-500/50"
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-slate-400">
          Card #{cardId}
        </span>
        {isWinner && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
            <Trophy className="w-3 h-3 text-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">WINNER!</span>
          </div>
        )}
      </div>

      {/* Bingo grid */}
      <div className="grid grid-cols-5 gap-1 md:gap-1.5">
        {/* Header Row */}
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div
            key={letter}
            className={cn(
              "flex items-center justify-center p-1.5 md:p-2",
              "text-base md:text-lg font-black text-white",
              "rounded-lg shadow-md",
              getHeaderColor(letter)
            )}
          >
            {letter}
          </div>
        ))}

        {/* Bingo Numbers */}
        {card.flat().map((cell, index) => (
          <div
            key={index}
            className={getCellClasses(cell)}
          >
            {getNumberDisplay(cell)}
          </div>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>
          Marked: {card.flat().filter(c => c.value === "FREE" || (typeof c.value === "number" && calledNumbers.includes(c.value))).length}/25
        </span>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-2 h-2 rounded-full",
                i < Math.floor(card.flat().filter(c => c.value === "FREE" || (typeof c.value === "number" && calledNumbers.includes(c.value))).length / 5)
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-slate-700"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default BingoCardDisplay;
