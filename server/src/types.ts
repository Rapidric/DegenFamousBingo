// User types
export interface TelegramUser {
  id: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isAdmin: boolean;
  createdAt: Date;
  balance: number;
}

// Bingo card types
export type BingoCardNumber = {
  value: number | "FREE";
  column: "B" | "I" | "N" | "G" | "O";
  isCalled: boolean;
};

export type BingoCard = BingoCardNumber[][];

// Game types
export interface PurchasedCard {
  id: string;
  cardData: BingoCard;
  ownerId: number;
  ownerUsername?: string;
  purchasePrice: number;
  purchasedAt: Date;
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
  createdAt: Date;
  startedAt: Date | null;
  endedAt: Date | null;
}

// Payment types
export interface PaymentRequest {
  id: string;
  userId: number;
  amount: number;
  currency: string;
  status: "pending" | "completed" | "failed";
  cardCount: number;
  gameId: string;
  createdAt: Date;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// Stats types
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
