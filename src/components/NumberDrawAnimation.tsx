"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface NumberDrawAnimationProps {
  number: number | null;
  isDrawing: boolean;
  onAnimationComplete?: () => void;
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
      return "from-red-500 to-pink-500";
    case "I":
      return "from-orange-500 to-yellow-500";
    case "N":
      return "from-green-500 to-emerald-500";
    case "G":
      return "from-blue-500 to-cyan-500";
    case "O":
      return "from-purple-500 to-violet-500";
    default:
      return "from-gray-500 to-gray-600";
  }
};

const NumberDrawAnimation: React.FC<NumberDrawAnimationProps> = ({
  number,
  isDrawing,
  onAnimationComplete,
}) => {
  const [displayNumber, setDisplayNumber] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [shuffleNumbers, setShuffleNumbers] = useState<number[]>([]);

  useEffect(() => {
    if (isDrawing && number !== null) {
      setIsAnimating(true);

      // Create shuffle effect
      const shuffleInterval = setInterval(() => {
        setShuffleNumbers(prev => {
          const newNum = Math.floor(Math.random() * 75) + 1;
          return [...prev.slice(-10), newNum];
        });
      }, 50);

      // After shuffle, reveal the actual number
      setTimeout(() => {
        clearInterval(shuffleInterval);
        setDisplayNumber(number);
        setShuffleNumbers([]);

        setTimeout(() => {
          setIsAnimating(false);
          onAnimationComplete?.();
        }, 2000);
      }, 1500);

      return () => clearInterval(shuffleInterval);
    }
  }, [isDrawing, number, onAnimationComplete]);

  const letter = displayNumber ? getColumnLetter(displayNumber) : "";
  const colorClass = letter ? getColumnColor(letter) : "from-gray-500 to-gray-600";

  if (!isDrawing && !displayNumber) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 border-4 border-slate-700 shadow-2xl">
        <div className="text-4xl mb-4">🎱</div>
        <p className="text-xl text-slate-400 font-semibold">Waiting for next number...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Background glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-3xl blur-3xl opacity-50 transition-all duration-500",
          isAnimating ? "scale-110" : "scale-100",
          `bg-gradient-to-br ${colorClass}`
        )}
      />

      {/* Main container */}
      <div
        className={cn(
          "relative flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "border-4 shadow-2xl transition-all duration-300",
          isAnimating
            ? "border-yellow-400 animate-pulse scale-105"
            : `border-transparent bg-gradient-to-br ${colorClass}`
        )}
      >
        {/* Sparkles during animation */}
        {isAnimating && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${0.5 + Math.random() * 0.5}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Number display area */}
        <div className="relative z-10">
          {isAnimating && shuffleNumbers.length > 0 ? (
            <div className="flex flex-col items-center">
              <div className="text-2xl text-yellow-400 mb-2 font-bold animate-bounce">
                DRAWING...
              </div>
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex items-center justify-center">
                {/* Spinning ball effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 animate-spin" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-4xl md:text-5xl font-black text-white animate-pulse">
                    {shuffleNumbers[shuffleNumbers.length - 1]}
                  </span>
                </div>
              </div>
            </div>
          ) : displayNumber ? (
            <div className="flex flex-col items-center animate-in zoom-in-50 duration-500">
              {/* Letter badge */}
              <div
                className={cn(
                  "px-6 py-2 rounded-full text-2xl md:text-3xl font-black text-white mb-4",
                  "shadow-lg transform -rotate-3",
                  `bg-gradient-to-r ${colorClass}`
                )}
              >
                {letter}
              </div>

              {/* Bingo ball */}
              <div className="relative">
                {/* Outer glow */}
                <div
                  className={cn(
                    "absolute -inset-4 rounded-full blur-xl opacity-75",
                    `bg-gradient-to-br ${colorClass}`
                  )}
                />

                {/* Ball */}
                <div
                  className={cn(
                    "relative w-36 h-36 md:w-48 md:h-48 rounded-full",
                    "flex items-center justify-center",
                    "shadow-2xl transform transition-transform duration-300 hover:scale-110",
                    `bg-gradient-to-br ${colorClass}`
                  )}
                >
                  {/* Inner white circle */}
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="text-5xl md:text-7xl font-black text-slate-900">
                      {displayNumber}
                    </span>
                  </div>

                  {/* Shine effect */}
                  <div className="absolute top-4 left-6 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/40 blur-sm" />
                </div>
              </div>

              {/* Call text */}
              <div className="mt-6 text-center">
                <p className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                  {letter}-{displayNumber}!
                </p>
                <p className="text-lg text-slate-300 mt-2">Check your cards!</p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Confetti effect on reveal */}
        {displayNumber && !isAnimating && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "absolute w-3 h-3 rounded-sm animate-bounce",
                  i % 5 === 0
                    ? "bg-red-500"
                    : i % 5 === 1
                    ? "bg-yellow-500"
                    : i % 5 === 2
                    ? "bg-green-500"
                    : i % 5 === 3
                    ? "bg-blue-500"
                    : "bg-purple-500"
                )}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animation: `fall ${2 + Math.random() * 2}s ease-in forwards`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  transform: `rotate(${Math.random() * 360}deg)`,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CSS for confetti animation */}
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default NumberDrawAnimation;
