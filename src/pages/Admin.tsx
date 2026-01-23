"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Admin = () => {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-gradient-to-br from-destructive/5 to-red-300/5">
      <Card className="w-full max-w-2xl text-center p-6 md:p-10 rounded-xl shadow-lg border-destructive/20">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-extrabold text-destructive mb-4">
            Admin Panel 🔒
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg md:text-xl text-foreground/80 leading-relaxed">
            This is the secure administration area. Only authorized personnel can access game controls.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button className="w-full sm:w-auto px-8 py-3 text-lg rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105">
              Start New Game
            </Button>
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto px-8 py-3 text-lg rounded-full border-2 border-primary text-primary hover:bg-primary/10 transition-all duration-300 ease-in-out transform hover:scale-105">
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="mt-8 text-sm text-muted-foreground">
            <p>Use with caution. All actions are logged. 🚨</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;