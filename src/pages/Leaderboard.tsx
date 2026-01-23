"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

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
            See who's dominating the DegenFamous arena!
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

export default Leaderboard;