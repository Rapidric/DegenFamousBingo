import express from "express";
import cors from "cors";
import { config } from "dotenv";
import { createTelegramBot } from "./telegramBot.js";
import { gameStore } from "./gameStore.js";
import { getColumnLetter } from "./bingo.js";

config();

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || "")
  .split(",")
  .map((id) => parseInt(id.trim()))
  .filter((id) => !isNaN(id));

// Middleware
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// Initialize Telegram bot if token is available
let bot: ReturnType<typeof createTelegramBot> | null = null;

if (process.env.TELEGRAM_BOT_TOKEN) {
  bot = createTelegramBot({
    token: process.env.TELEGRAM_BOT_TOKEN,
    adminIds: ADMIN_USER_IDS,
    frontendUrl: FRONTEND_URL,
  });

  bot.launch().then(() => {
    console.log("🤖 Telegram bot is running!");
  });
} else {
  console.log("⚠️ TELEGRAM_BOT_TOKEN not set - bot will not start");
}

// Auth middleware for admin routes
const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const userId = parseInt(req.headers["x-telegram-user-id"] as string);
  if (!userId || !ADMIN_USER_IDS.includes(userId)) {
    res.status(403).json({ success: false, error: "Unauthorized" });
    return;
  }
  next();
};

// API Routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({ success: true, data: { status: "ok", botRunning: !!bot } });
});

// Auth endpoints
app.post("/api/auth/telegram", (req, res) => {
  const { telegramUser } = req.body;

  if (!telegramUser || !telegramUser.id) {
    res.status(400).json({ success: false, error: "Invalid telegram user data" });
    return;
  }

  const user = gameStore.createUser(telegramUser, ADMIN_USER_IDS);
  res.json({ success: true, data: { user } });
});

app.get("/api/auth/user/:userId", (req, res) => {
  const userId = parseInt(req.params.userId);
  const user = gameStore.getUser(userId);

  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  res.json({ success: true, data: { user } });
});

// Game endpoints
app.get("/api/game/current", (req, res) => {
  const game = gameStore.getCurrentGame();
  res.json({ success: true, data: { game } });
});

app.get("/api/game/:gameId", (req, res) => {
  const game = gameStore.getGame(req.params.gameId);

  if (!game) {
    res.status(404).json({ success: false, error: "Game not found" });
    return;
  }

  res.json({ success: true, data: { game } });
});

app.get("/api/game/:gameId/cards/:userId", (req, res) => {
  const gameId = req.params.gameId;
  const userId = parseInt(req.params.userId);

  const cards = gameStore.getUserCardsForGame(gameId, userId);
  res.json({ success: true, data: { cards } });
});

app.post("/api/game/:gameId/purchase", (req, res) => {
  const { userId, username, cardCount } = req.body;
  const gameId = req.params.gameId;

  try {
    const game = gameStore.getGame(gameId);
    if (!game) {
      res.status(404).json({ success: false, error: "Game not found" });
      return;
    }

    const totalCost = game.cardPrice * cardCount;
    const user = gameStore.getUser(userId);

    if (!user || user.balance < totalCost) {
      res.status(400).json({ success: false, error: "Insufficient balance" });
      return;
    }

    gameStore.updateUserBalance(userId, -totalCost);
    const cards = gameStore.purchaseCards(gameId, userId, username, cardCount);

    res.json({ success: true, data: { cards, newBalance: user.balance - totalCost } });
  } catch (error) {
    res.status(400).json({ success: false, error: (error as Error).message });
  }
});

// Admin endpoints
app.get("/api/admin/stats", adminAuth, (req, res) => {
  const stats = gameStore.getStats();
  res.json({ success: true, data: { stats } });
});

app.get("/api/admin/history", adminAuth, (req, res) => {
  const limit = parseInt(req.query.limit as string) || 10;
  const history = gameStore.getGameHistory(limit);
  res.json({ success: true, data: { history } });
});

app.get("/api/admin/users", adminAuth, (req, res) => {
  const users = gameStore.getAllUsers();
  res.json({ success: true, data: { users } });
});

app.post("/api/admin/game/create", adminAuth, (req, res) => {
  const { cardPrice } = req.body;
  const game = gameStore.createGame(cardPrice || 1.0);
  res.json({ success: true, data: { game } });
});

app.post("/api/admin/game/:gameId/start", adminAuth, (req, res) => {
  const game = gameStore.startGame(req.params.gameId);

  if (!game) {
    res.status(400).json({ success: false, error: "Cannot start game" });
    return;
  }

  res.json({ success: true, data: { game } });
});

app.post("/api/admin/game/:gameId/call", adminAuth, (req, res) => {
  const result = gameStore.callNextNumber(req.params.gameId);
  const game = gameStore.getGame(req.params.gameId);

  res.json({
    success: true,
    data: {
      number: result.number,
      columnLetter: result.columnLetter,
      winner: result.winner,
      game,
    },
  });
});

app.post("/api/admin/game/:gameId/end", adminAuth, (req, res) => {
  gameStore.endGame(req.params.gameId);
  res.json({ success: true });
});

// Payment endpoints (CWallet integration stub)
app.post("/api/payment/create", (req, res) => {
  const { userId, amount, cardCount, gameId } = req.body;

  const payment = gameStore.createPayment(userId, amount, cardCount, gameId);

  // In production, this would create a CWallet payment request
  // For demo, we return a simulated payment URL
  res.json({
    success: true,
    data: {
      payment,
      paymentUrl: `https://cwallet.com/pay?merchant=${process.env.CWALLET_MERCHANT_ID}&amount=${amount}&currency=USDT&ref=${payment.id}`,
    },
  });
});

app.post("/api/payment/webhook", (req, res) => {
  // CWallet webhook handler
  const { paymentId, status } = req.body;

  if (status === "completed") {
    const payment = gameStore.completePayment(paymentId);
    if (payment) {
      gameStore.updateUserBalance(payment.userId, payment.amount);
    }
  }

  res.json({ success: true });
});

// Simulate deposit for testing
app.post("/api/payment/simulate-deposit", (req, res) => {
  const { userId, amount } = req.body;

  const user = gameStore.getUser(userId);
  if (!user) {
    res.status(404).json({ success: false, error: "User not found" });
    return;
  }

  gameStore.updateUserBalance(userId, amount);

  res.json({
    success: true,
    data: { newBalance: user.balance + amount },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
  console.log(`👑 Admin User IDs: ${ADMIN_USER_IDS.join(", ") || "None configured"}`);
});

// Graceful shutdown
process.once("SIGINT", () => {
  bot?.stop("SIGINT");
  process.exit(0);
});
process.once("SIGTERM", () => {
  bot?.stop("SIGTERM");
  process.exit(0);
});
