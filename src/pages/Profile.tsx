"use client";

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Wallet, History, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const Profile = () => {
  const userId = "telegram_user_12345";
  const userName = "RapidRic";
  const walletBalance = "100.50 USDT";
  const transactionHistory = [
    { id: "tx1", type: "Purchase", amount: "-$1.00", date: "2023-10-26 10:30 AM", status: "Completed" },
    { id: "tx2", type: "Deposit", amount: "+$50.00", date: "2023-10-25 09:00 AM", status: "Completed" },
    { id: "tx3", type: "Win", amount: "+$15.00", date: "2023-10-24 03:15 PM", status: "Completed" },
    { id: "tx4", type: "Purchase", amount: "-$2.50", date: "2023-10-24 03:00 PM", status: "Completed" },
  ];

  const handleDeposit = () => {
    alert("Simulating deposit... (Integrate Cwallet API here)");
  };

  const handleWithdraw = () => {
    alert("Simulating withdrawal... (Integrate Cwallet API here)");
  };

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-accent/5 to-primary/5">
      <Card className="w-full max-w-3xl p-6 md:p-10 rounded-xl shadow-lg border-accent/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-primary mb-4">
            My Profile & Wallet 👤💰
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <User className="h-16 w-16 text-primary" />
            <h3 className="text-2xl font-bold text-foreground">{userName}</h3>
            <p className="text-md text-muted-foreground">Telegram ID: {userId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-4 rounded-lg shadow-md border-primary/20 bg-primary/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-primary">Wallet Balance</CardTitle>
                <Wallet className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{walletBalance}</div>
                <p className="text-xs text-muted-foreground mt-1">Available for games</p>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleDeposit} className="flex-1 rounded-full bg-green-500 hover:bg-green-600 text-white">
                    Deposit
                  </Button>
                  <Button onClick={handleWithdraw} variant="outline" className="flex-1 rounded-full border-green-500 text-green-500 hover:bg-green-500/10">
                    Withdraw
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="p-4 rounded-lg shadow-md border-accent/20 bg-accent/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium text-accent-foreground">Loyalty Rewards</CardTitle>
                <img src="/placeholder.svg" alt="Trophy" className="h-5 w-5 text-accent-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">500 Points</div>
                <p className="text-xs text-muted-foreground mt-1">Earned from playing</p>
                <Button className="w-full rounded-full bg-accent hover:bg-accent/90 text-accent-foreground mt-4">
                  Redeem Rewards
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <History className="h-6 w-6 text-primary" /> Transaction History
            </h3>
            <div className="border rounded-lg overflow-hidden">
              {transactionHistory.length > 0 ? (
                <ul className="divide-y divide-border">
                  {transactionHistory.map((tx) => (
                    <li key={tx.id} className="flex justify-between items-center p-3 hover:bg-muted/50 transition-colors">
                      <div>
                        <p className="font-medium text-foreground">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">{tx.date}</p>
                      </div>
                      <div className={cn(
                        "font-bold",
                        tx.amount.startsWith("+") ? "text-green-600" : "text-red-600"
                      )}>
                        {tx.amount}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="p-4 text-center text-muted-foreground">No transactions yet.</p>
              )}
            </div>
          </div>

          <div className="text-center mt-8">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;