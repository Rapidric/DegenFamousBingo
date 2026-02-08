const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = localStorage.getItem("telegramUserId");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(userId && { "x-telegram-user-id": userId }),
      ...options.headers,
    },
  });

  const data: ApiResponse<T> = await response.json();

  if (!data.success) {
    throw new Error(data.error || "API request failed");
  }

  return data.data as T;
}

// Auth API
export const authApi = {
  loginWithTelegram: async (telegramUser: TelegramUser) => {
    const result = await apiRequest<{ user: User }>("/api/auth/telegram", {
      method: "POST",
      body: JSON.stringify({ telegramUser }),
    });
    localStorage.setItem("telegramUserId", telegramUser.id.toString());
    return result.user;
  },

  getUser: async (userId: number) => {
    return apiRequest<{ user: User }>(`/api/auth/user/${userId}`);
  },
};

// Game API
export const gameApi = {
  getCurrentGame: async () => {
    return apiRequest<{ game: BingoGame | null }>("/api/game/current");
  },

  getGame: async (gameId: string) => {
    return apiRequest<{ game: BingoGame }>(`/api/game/${gameId}`);
  },

  getUserCards: async (gameId: string, userId: number) => {
    return apiRequest<{ cards: PurchasedCard[] }>(
      `/api/game/${gameId}/cards/${userId}`
    );
  },

  purchaseCards: async (
    gameId: string,
    userId: number,
    username: string,
    cardCount: number
  ) => {
    return apiRequest<{ cards: PurchasedCard[]; newBalance: number }>(
      `/api/game/${gameId}/purchase`,
      {
        method: "POST",
        body: JSON.stringify({ userId, username, cardCount }),
      }
    );
  },
};

// Admin API
export const adminApi = {
  getStats: async () => {
    return apiRequest<{ stats: GameStats }>("/api/admin/stats");
  },

  getHistory: async (limit = 10) => {
    return apiRequest<{ history: GameHistoryItem[] }>(
      `/api/admin/history?limit=${limit}`
    );
  },

  getUsers: async () => {
    return apiRequest<{ users: User[] }>("/api/admin/users");
  },

  createGame: async (cardPrice: number) => {
    return apiRequest<{ game: BingoGame }>("/api/admin/game/create", {
      method: "POST",
      body: JSON.stringify({ cardPrice }),
    });
  },

  startGame: async (gameId: string) => {
    return apiRequest<{ game: BingoGame }>(`/api/admin/game/${gameId}/start`, {
      method: "POST",
    });
  },

  callNumber: async (gameId: string) => {
    return apiRequest<{
      number: number | null;
      columnLetter: string;
      winner: PurchasedCard | null;
      game: BingoGame;
    }>(`/api/admin/game/${gameId}/call`, {
      method: "POST",
    });
  },

  endGame: async (gameId: string) => {
    return apiRequest<void>(`/api/admin/game/${gameId}/end`, {
      method: "POST",
    });
  },
};

// Payment API
export const paymentApi = {
  createPayment: async (
    userId: number,
    amount: number,
    cardCount: number,
    gameId: string
  ) => {
    return apiRequest<{ payment: PaymentRequest; paymentUrl: string }>(
      "/api/payment/create",
      {
        method: "POST",
        body: JSON.stringify({ userId, amount, cardCount, gameId }),
      }
    );
  },

  simulateDeposit: async (userId: number, amount: number) => {
    return apiRequest<{ newBalance: number }>("/api/payment/simulate-deposit", {
      method: "POST",
      body: JSON.stringify({ userId, amount }),
    });
  },
};

// Types
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface User {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isAdmin: boolean;
  createdAt: string;
  balance: number;
}

export interface BingoCardNumber {
  value: number | "FREE";
  column: "B" | "I" | "N" | "G" | "O";
  isCalled: boolean;
}

export type BingoCard = BingoCardNumber[][];

export interface PurchasedCard {
  id: string;
  cardData: BingoCard;
  ownerId: number;
  ownerUsername?: string;
  purchasePrice: number;
  purchasedAt: string;
}

export interface BingoGame {
  id: string;
  status: "waiting" | "in_progress" | "completed";
  cards: PurchasedCard[];
  calledNumbers: number[];
  currentNumber: number | null;
  winnerId: string | null;
  winnerUserId: number | null;
  prizePool: number;
  cardPrice: number;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

export interface GameStats {
  totalGamesPlayed: number;
  totalCardsSold: number;
  totalWinningsDistributed: number;
  activePlayers: number;
  activeGames: number;
}

export interface GameHistoryItem {
  id: string;
  winner: string;
  winnerId: number;
  prize: number;
  date: string;
  totalPlayers: number;
}

export interface PaymentRequest {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  cardCount: number;
  gameId: string;
  createdAt: string;
}
