"use client";

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Gamepad2,
  Shield,
  User,
  Trophy,
  Wallet,
  Menu,
  LogOut,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const Header = () => {
  const { user, isLoading, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { href: "/game", label: "Play", icon: Gamepad2 },
    { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
    { href: "/admin", label: "Admin", icon: Shield, adminOnly: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-slate-900/95 backdrop-blur-md">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 group-hover:scale-110 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-xl bg-gradient-to-r from-yellow-400 to-pink-500 bg-clip-text text-transparent hidden sm:block">
            DegenFamousBingo
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            if (item.adminOnly && !user?.isAdmin) return null;

            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "rounded-xl font-semibold transition-all",
                    isActive(item.href)
                      ? "bg-purple-500/20 text-purple-300"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Balance display */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/20 border border-green-500/30">
                <Wallet className="w-4 h-4 text-green-400" />
                <span className="text-sm font-semibold text-green-400">
                  $100.00
                </span>
              </div>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-full px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                      {user.firstName?.[0] || "U"}
                    </div>
                    <span className="text-sm font-semibold text-purple-300 hidden sm:block">
                      {user.firstName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-slate-900 border-slate-700"
                >
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-white">{user.firstName}</p>
                    <p className="text-xs text-slate-400">
                      @{user.username || "telegram user"}
                    </p>
                  </div>
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      to="/game"
                      className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
                    >
                      <Gamepad2 className="w-4 h-4" />
                      Play Game
                    </Link>
                  </DropdownMenuItem>
                  {user.isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/admin"
                        className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-slate-700" />
                  <DropdownMenuItem
                    onClick={logout}
                    className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/game">
              <Button className="rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}

          {/* Mobile menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-slate-300 hover:text-white"
              >
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-slate-900 border-slate-700"
            >
              {navItems.map((item) => {
                if (item.adminOnly && !user?.isAdmin) return null;

                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      to={item.href}
                      className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white"
                    >
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
