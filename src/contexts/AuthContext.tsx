"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, TelegramUser, authApi } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (telegramUser: TelegramUser) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedUserId = localStorage.getItem("telegramUserId");
      if (storedUserId) {
        try {
          const { user } = await authApi.getUser(parseInt(storedUserId));
          setUser(user);
        } catch (error) {
          console.error("Failed to restore session:", error);
          localStorage.removeItem("telegramUserId");
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (telegramUser: TelegramUser) => {
    const loggedInUser = await authApi.loginWithTelegram(telegramUser);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem("telegramUserId");
    setUser(null);
  };

  const refreshUser = async () => {
    if (user) {
      try {
        const { user: refreshedUser } = await authApi.getUser(user.id);
        setUser(refreshedUser);
      } catch (error) {
        console.error("Failed to refresh user:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin: user?.isAdmin ?? false,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
