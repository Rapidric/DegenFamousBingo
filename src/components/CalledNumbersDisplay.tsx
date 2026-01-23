"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CalledNumbersDisplayProps {
  calledNumbers: number[];
  currentCalledNumber: number | null;
}

const CalledNumbersDisplay: React.FC<CalledNumbersDisplayProps> = ({
  calledNumbers,
  currentCalledNumber,
}) => {
  return (
    <Card className="w-full p-4 rounded-xl shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-extrabold text-primary">
          Called Numbers History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap justify-center gap-2 max-h-48 overflow-y-auto p-2 rounded-lg border border-primary/10 bg-background/50">
          {calledNumbers.length === 0 ? (
            <p className="text-muted-foreground text-sm">No numbers called yet.</p>
          ) : (
            calledNumbers.map((num, index) => (
              <span
                key={index}
                className={cn(
                  "px-3 py-1 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out",
                  num === currentCalledNumber
                    ? "bg-destructive text-destructive-foreground scale-110 shadow-md animate-pulse"
                    : "bg-primary/20 text-primary hover:bg-primary/30"
                )}
              >
                {num}
              </span>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalledNumbersDisplay;