"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CalledNumbersBoardProps {
  calledNumbers: number[];
}

const getColumnLetter = (number: number): string => {
  if (number >= 1 && number <= 15) return "B";
  if (number >= 16 && number <= 30) return "I";
  if (number >= 31 && number <= 45) return "N";
  if (number >= 46 && number <= 60) return "G";
  if (number >= 61 && number <= 75) return "O";
  return "";
};

const getColumnColor = (letter: string): string => {
  switch (letter) {
    case "B":
      return "bg-gradient-to-br from-red-500 to-pink-600 text-white";
    case "I":
      return "bg-gradient-to-br from-orange-500 to-yellow-500 text-white";
    case "N":
      return "bg-gradient-to-br from-green-500 to-emerald-600 text-white";
    case "G":
      return "bg-gradient-to-br from-blue-500 to-cyan-600 text-white";
    case "O":
      return "bg-gradient-to-br from-purple-500 to-violet-600 text-white";
    default:
      return "bg-gray-500 text-white";
  }
};

const CalledNumbersBoard: React.FC<CalledNumbersBoardProps> = ({ calledNumbers }) => {
  const columns: Record<string, number[]> = {
    B: [],
    I: [],
    N: [],
    G: [],
    O: [],
  };

  // Organize numbers by column
  calledNumbers.forEach((num) => {
    const letter = getColumnLetter(num);
    if (letter) {
      columns[letter].push(num);
    }
  });

  // Sort each column
  Object.keys(columns).forEach((key) => {
    columns[key].sort((a, b) => a - b);
  });

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-4 md:p-6 rounded-2xl border-2 border-slate-700 shadow-2xl">
      <h3 className="text-xl md:text-2xl font-bold text-white text-center mb-4">
        Called Numbers ({calledNumbers.length}/75)
      </h3>

      <div className="grid grid-cols-5 gap-2 md:gap-3">
        {["B", "I", "N", "G", "O"].map((letter) => (
          <div key={letter} className="space-y-2">
            {/* Column header */}
            <div
              className={cn(
                "py-2 md:py-3 rounded-lg font-black text-xl md:text-2xl text-center",
                getColumnColor(letter)
              )}
            >
              {letter}
            </div>

            {/* Numbers in column */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {columns[letter].length > 0 ? (
                columns[letter].map((num, index) => (
                  <div
                    key={num}
                    className={cn(
                      "py-1.5 md:py-2 rounded-md font-bold text-center text-sm md:text-base",
                      "transition-all duration-300 animate-in slide-in-from-top",
                      "bg-slate-700/50 text-white hover:scale-105 cursor-default"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {num}
                  </div>
                ))
              ) : (
                <div className="py-2 text-center text-slate-500 text-sm">-</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recent calls indicator */}
      {calledNumbers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <p className="text-sm text-slate-400 mb-2">Recent calls:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {calledNumbers.slice(-8).reverse().map((num, index) => {
              const letter = getColumnLetter(num);
              return (
                <span
                  key={`recent-${num}-${index}`}
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-bold",
                    index === 0 ? "ring-2 ring-yellow-400 ring-offset-2 ring-offset-slate-900" : "",
                    getColumnColor(letter)
                  )}
                >
                  {letter}-{num}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalledNumbersBoard;
