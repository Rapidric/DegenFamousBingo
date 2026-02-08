import { v4 as uuidv4 } from "uuid";
import { BingoGame, TelegramUser, PurchasedCard, PaymentRequest, GameStats, GameHistoryItem } from "./types.js";
import { generateBingoCard, generateCalledNumbers, checkBingo, getColumnLetter } from "./bingo.js";

// In-memory storage (in production, use a database)
class GameStore {
  private users: Map<number, TelegramUser> = new Map();
  private games: Map<string, BingoGame> = new Map();
  private payments: Map<string, PaymentRequest> = new Map();
  private currentGame: BingoGame | null = null;
  private shuffledNumbers: number[] = [];
  private gameHistory: GameHistoryItem[] = [];
  private totalStats: GameStats = {
    totalGamesPlayed: 0,
    totalCardsSold: 0,
    totalWinningsDistributed: 0,
    activePlayers: 0,
    activeGames: 0,
  };

  // User management
  getUser(userId: number): TelegramUser | undefined {
    return this.users.get(userId);
  }

  createUser(telegramData: { id: number; username?: string; first_name: string; last_name?: string; photo_url?: string }, adminIds: number[]): TelegramUser {
    const existingUser = this.users.get(telegramData.id);
    if (existingUser) {
      return existingUser;
    }

    const user: TelegramUser = {
      id: telegramData.id,
      username: telegramData.username,
      firstName: telegramData.first_name,
      lastName: telegramData.last_name,
      photoUrl: telegramData.photo_url,
      isAdmin: adminIds.includes(telegramData.id),
      createdAt: new Date(),
      balance: 0,
    };

    this.users.set(telegramData.id, user);
    this.totalStats.activePlayers = this.users.size;
    return user;
  }

  updateUserBalance(userId: number, amount: number): boolean {
    const user = this.users.get(userId);
    if (!user) return false;
    user.balance += amount;
    return true;
  }

  getAllUsers(): TelegramUser[] {
    return Array.from(this.users.values());
  }

  // Game management
  createGame(cardPrice: number): BingoGame {
    const game: BingoGame = {
      id: uuidv4(),
      status: "waiting",
      cards: [],
      calledNumbers: [],
      currentNumber: null,
      winnerId: null,
      winnerUserId: null,
      prizePool: 0,
      cardPrice,
      createdAt: new Date(),
      startedAt: null,
      endedAt: null,
    };

    this.games.set(game.id, game);
    this.currentGame = game;
    this.shuffledNumbers = generateCalledNumbers();
    this.totalStats.activeGames = 1;
    return game;
  }

  getCurrentGame(): BingoGame | null {
    return this.currentGame;
  }

  getGame(gameId: string): BingoGame | undefined {
    return this.games.get(gameId);
  }

  purchaseCards(gameId: string, userId: number, username: string | undefined, cardCount: number): PurchasedCard[] {
    const game = this.games.get(gameId);
    if (!game || game.status !== "waiting") {
      throw new Error("Cannot purchase cards - game not available or already started");
    }

    const newCards: PurchasedCard[] = [];
    for (let i = 0; i < cardCount; i++) {
      const card: PurchasedCard = {
        id: uuidv4(),
        cardData: generateBingoCard(),
        ownerId: userId,
        ownerUsername: username,
        purchasePrice: game.cardPrice,
        purchasedAt: new Date(),
      };
      newCards.push(card);
      game.cards.push(card);
    }

    game.prizePool += cardCount * game.cardPrice;
    this.totalStats.totalCardsSold += cardCount;

    return newCards;
  }

  getUserCardsForGame(gameId: string, userId: number): PurchasedCard[] {
    const game = this.games.get(gameId);
    if (!game) return [];
    return game.cards.filter(card => card.ownerId === userId);
  }

  startGame(gameId: string): BingoGame | null {
    const game = this.games.get(gameId);
    if (!game || game.status !== "waiting" || game.cards.length === 0) {
      return null;
    }

    game.status = "in_progress";
    game.startedAt = new Date();
    this.shuffledNumbers = generateCalledNumbers();
    return game;
  }

  callNextNumber(gameId: string): { number: number | null; winner: PurchasedCard | null; columnLetter: string } {
    const game = this.games.get(gameId);
    if (!game || game.status !== "in_progress") {
      return { number: null, winner: null, columnLetter: "" };
    }

    if (game.calledNumbers.length >= 75) {
      return { number: null, winner: null, columnLetter: "" };
    }

    const nextNumber = this.shuffledNumbers[game.calledNumbers.length];
    game.calledNumbers.push(nextNumber);
    game.currentNumber = nextNumber;
    const columnLetter = getColumnLetter(nextNumber);

    // Check for winners
    for (const card of game.cards) {
      if (checkBingo(card.cardData, game.calledNumbers)) {
        game.winnerId = card.id;
        game.winnerUserId = card.ownerId;
        game.status = "completed";
        game.endedAt = new Date();

        // Update stats
        this.totalStats.totalGamesPlayed++;
        this.totalStats.totalWinningsDistributed += game.prizePool * 0.9; // 90% to winner
        this.totalStats.activeGames = 0;

        // Add to history
        this.gameHistory.unshift({
          id: game.id.substring(0, 8),
          winner: card.ownerUsername || `User ${card.ownerId}`,
          winnerId: card.ownerId,
          prize: game.prizePool * 0.9,
          date: new Date().toLocaleString(),
          totalPlayers: new Set(game.cards.map(c => c.ownerId)).size,
        });

        // Award prize
        this.updateUserBalance(card.ownerId, game.prizePool * 0.9);

        this.currentGame = null;

        return { number: nextNumber, winner: card, columnLetter };
      }
    }

    return { number: nextNumber, winner: null, columnLetter };
  }

  endGame(gameId: string): void {
    const game = this.games.get(gameId);
    if (!game) return;

    game.status = "completed";
    game.endedAt = new Date();
    this.totalStats.activeGames = 0;
    this.currentGame = null;
  }

  // Stats and history
  getStats(): GameStats {
    return { ...this.totalStats };
  }

  getGameHistory(limit = 10): GameHistoryItem[] {
    return this.gameHistory.slice(0, limit);
  }

  // Payments
  createPayment(userId: number, amount: number, cardCount: number, gameId: string): PaymentRequest {
    const payment: PaymentRequest = {
      id: uuidv4(),
      userId,
      amount,
      currency: "USDT",
      status: "pending",
      cardCount,
      gameId,
      createdAt: new Date(),
    };

    this.payments.set(payment.id, payment);
    return payment;
  }

  completePayment(paymentId: string): PaymentRequest | null {
    const payment = this.payments.get(paymentId);
    if (!payment) return null;

    payment.status = "completed";
    return payment;
  }

  getPayment(paymentId: string): PaymentRequest | undefined {
    return this.payments.get(paymentId);
  }
}

export const gameStore = new GameStore();
