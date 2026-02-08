import { Telegraf, Context, Markup } from "telegraf";
import { gameStore } from "./gameStore.js";
import { getColumnLetter } from "./bingo.js";

interface BotConfig {
  token: string;
  adminIds: number[];
  frontendUrl: string;
}

export const createTelegramBot = (config: BotConfig) => {
  const bot = new Telegraf(config.token);

  // Middleware to check if user is admin
  const adminOnly = async (ctx: Context, next: () => Promise<void>) => {
    const userId = ctx.from?.id;
    if (!userId || !config.adminIds.includes(userId)) {
      await ctx.reply("⛔ Sorry, this command is only available to administrators.");
      return;
    }
    return next();
  };

  // Start command - One-click signup
  bot.command("start", async (ctx) => {
    const telegramUser = ctx.from;
    if (!telegramUser) {
      await ctx.reply("Unable to identify user. Please try again.");
      return;
    }

    // Create or get existing user
    const user = gameStore.createUser(
      {
        id: telegramUser.id,
        username: telegramUser.username,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
      },
      config.adminIds
    );

    const welcomeMessage = `
🎰 *Welcome to DegenFamousBingo!* 🎰

Hey ${user.firstName}! 👋

You're all set up and ready to play! 🎉

*Your Profile:*
• Username: @${user.username || "not set"}
• Balance: $${user.balance.toFixed(2)}
• Status: ${user.isAdmin ? "🔐 Admin" : "🎮 Player"}

*Available Commands:*
/play - Join the current game
/cards - View your bingo cards
/balance - Check your balance
/deposit - Add funds via CWallet
/help - Show all commands

${user.isAdmin ? "*Admin Commands:*\n/newgame - Create a new game\n/startgame - Start the current game\n/callnumber - Call the next number\n/admin - Open admin dashboard" : ""}

Ready to win big? Let's go! 🚀
    `;

    await ctx.reply(welcomeMessage, {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.webApp("🎮 Play Now!", `${config.frontendUrl}/game`)],
        [Markup.button.callback("💰 Deposit Funds", "deposit")],
        [Markup.button.callback("📊 View Leaderboard", "leaderboard")],
      ]),
    });
  });

  // Help command
  bot.command("help", async (ctx) => {
    const userId = ctx.from?.id;
    const user = userId ? gameStore.getUser(userId) : null;

    const helpMessage = `
🎰 *DegenFamousBingo Commands* 🎰

*Player Commands:*
/start - Register and get started
/play - Join the current game
/cards - View your purchased bingo cards
/balance - Check your wallet balance
/deposit - Add funds via CWallet
/withdraw - Withdraw your winnings
/history - View game history
/leaderboard - See top players

${user?.isAdmin ? "*Admin Commands:*\n/newgame <price> - Create a new game (e.g., /newgame 1.00)\n/startgame - Start the current game\n/callnumber - Call the next number\n/endgame - End the current game\n/stats - View game statistics\n/admin - Open admin dashboard\n/broadcast <message> - Send message to all users" : ""}

Need help? Contact @DegenFamousSupport
    `;

    await ctx.reply(helpMessage, { parse_mode: "Markdown" });
  });

  // Play command
  bot.command("play", async (ctx) => {
    const currentGame = gameStore.getCurrentGame();

    if (!currentGame) {
      await ctx.reply(
        "🎮 No active game right now!\n\nWait for an admin to start a new game, or check back soon! 🎰",
        Markup.inlineKeyboard([
          [Markup.button.callback("🔔 Notify Me", "notify_game")],
        ])
      );
      return;
    }

    const gameStatus = currentGame.status === "waiting" ? "⏳ Waiting for players" : "🎯 In progress";
    const playersCount = new Set(currentGame.cards.map((c) => c.ownerId)).size;

    await ctx.reply(
      `
🎰 *Current Game* 🎰

Status: ${gameStatus}
Card Price: $${currentGame.cardPrice.toFixed(2)}
Players: ${playersCount}
Total Cards: ${currentGame.cards.length}
Prize Pool: $${currentGame.prizePool.toFixed(2)} 💰

${currentGame.status === "in_progress" ? `Numbers Called: ${currentGame.calledNumbers.length}/75\nLast Number: ${currentGame.currentNumber ? `${getColumnLetter(currentGame.currentNumber)}-${currentGame.currentNumber}` : "None yet"}` : ""}
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard(
          currentGame.status === "waiting"
            ? [
                [Markup.button.callback("🎫 Buy 1 Card", `buy_1_${currentGame.id}`)],
                [Markup.button.callback("🎫 Buy 3 Cards", `buy_3_${currentGame.id}`)],
                [Markup.button.callback("🎫 Buy 5 Cards", `buy_5_${currentGame.id}`)],
                [Markup.button.webApp("🎮 Open Game", `${config.frontendUrl}/game`)],
              ]
            : [
                [Markup.button.webApp("🎮 Watch Game", `${config.frontendUrl}/game`)],
              ]
        ),
      }
    );
  });

  // Buy cards callback
  bot.action(/buy_(\d+)_(.+)/, async (ctx) => {
    const match = ctx.match;
    const cardCount = parseInt(match[1]);
    const gameId = match[2];

    const userId = ctx.from?.id;
    const username = ctx.from?.username;

    if (!userId) {
      await ctx.answerCbQuery("Unable to identify user");
      return;
    }

    const game = gameStore.getGame(gameId);
    if (!game || game.status !== "waiting") {
      await ctx.answerCbQuery("Game is no longer available for purchases");
      return;
    }

    const totalCost = game.cardPrice * cardCount;
    const user = gameStore.getUser(userId);

    if (!user || user.balance < totalCost) {
      await ctx.answerCbQuery("Insufficient balance! Please deposit funds.");
      await ctx.reply(
        `💰 You need $${totalCost.toFixed(2)} to buy ${cardCount} card(s).\nYour balance: $${(user?.balance || 0).toFixed(2)}\n\nPlease deposit funds to continue!`,
        Markup.inlineKeyboard([
          [Markup.button.callback("💳 Deposit via CWallet", "deposit")],
        ])
      );
      return;
    }

    // Deduct balance and purchase cards
    gameStore.updateUserBalance(userId, -totalCost);
    const cards = gameStore.purchaseCards(gameId, userId, username, cardCount);

    await ctx.answerCbQuery(`✅ Purchased ${cardCount} card(s)!`);
    await ctx.reply(
      `
🎫 *Cards Purchased!* 🎫

You bought ${cardCount} card(s) for $${totalCost.toFixed(2)}

Your new balance: $${(user.balance - totalCost).toFixed(2)}

Card IDs:
${cards.map((c) => `• ${c.id.substring(0, 8)}`).join("\n")}

Good luck! 🍀
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("🎮 View Cards", `${config.frontendUrl}/game`)],
        ]),
      }
    );
  });

  // Balance command
  bot.command("balance", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = gameStore.getUser(userId);
    if (!user) {
      await ctx.reply("Please use /start to register first!");
      return;
    }

    await ctx.reply(
      `
💰 *Your Balance* 💰

Current Balance: $${user.balance.toFixed(2)}

Use /deposit to add funds via CWallet
Use /withdraw to cash out your winnings
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("💳 Deposit", "deposit")],
          [Markup.button.callback("💸 Withdraw", "withdraw")],
        ]),
      }
    );
  });

  // Deposit callback
  bot.action("deposit", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply(
      `
💳 *Deposit via CWallet* 💳

Select the amount to deposit:
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("$5.00", "deposit_5")],
          [Markup.button.callback("$10.00", "deposit_10")],
          [Markup.button.callback("$25.00", "deposit_25")],
          [Markup.button.callback("$50.00", "deposit_50")],
          [Markup.button.callback("$100.00", "deposit_100")],
        ]),
      }
    );
  });

  // Deposit amount callbacks
  bot.action(/deposit_(\d+)/, async (ctx) => {
    const amount = parseInt(ctx.match[1]);
    const userId = ctx.from?.id;

    if (!userId) {
      await ctx.answerCbQuery("Unable to identify user");
      return;
    }

    // Create payment request (in production, this would integrate with CWallet API)
    const currentGame = gameStore.getCurrentGame();
    const payment = gameStore.createPayment(
      userId,
      amount,
      0,
      currentGame?.id || "wallet"
    );

    await ctx.answerCbQuery("Processing...");

    // For demo purposes, we'll simulate a successful payment
    // In production, this would redirect to CWallet payment page
    gameStore.completePayment(payment.id);
    gameStore.updateUserBalance(userId, amount);

    await ctx.reply(
      `
✅ *Deposit Successful!* ✅

Amount: $${amount.toFixed(2)}
Payment ID: ${payment.id.substring(0, 8)}

Your funds have been added to your balance! 🎉

Use /balance to check your new balance.
Use /play to join a game!
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.callback("🎮 Play Now", "play_game")],
          [Markup.button.callback("💰 Check Balance", "check_balance")],
        ]),
      }
    );
  });

  // Cards command
  bot.command("cards", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const currentGame = gameStore.getCurrentGame();
    if (!currentGame) {
      await ctx.reply("No active game. Your cards will appear here when you join a game!");
      return;
    }

    const userCards = gameStore.getUserCardsForGame(currentGame.id, userId);

    if (userCards.length === 0) {
      await ctx.reply(
        "You don't have any cards for the current game.\n\nUse /play to purchase cards!",
        Markup.inlineKeyboard([
          [Markup.button.callback("🎫 Buy Cards", "play_game")],
        ])
      );
      return;
    }

    await ctx.reply(
      `
🎫 *Your Bingo Cards* 🎫

You have ${userCards.length} card(s) in the current game!

Card IDs:
${userCards.map((c) => `• ${c.id.substring(0, 8)}`).join("\n")}

Open the game to view your full cards and track called numbers!
      `,
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("🎮 View Cards", `${config.frontendUrl}/game`)],
        ]),
      }
    );
  });

  // Admin commands
  bot.command("newgame", adminOnly, async (ctx) => {
    const args = ctx.message.text.split(" ");
    const price = parseFloat(args[1]) || 1.0;

    const game = gameStore.createGame(price);

    await ctx.reply(
      `
🎰 *New Game Created!* 🎰

Game ID: ${game.id.substring(0, 8)}
Card Price: $${price.toFixed(2)}
Status: Waiting for players

Share this game with players using /play

Use /startgame to begin when ready!
      `,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("startgame", adminOnly, async (ctx) => {
    const currentGame = gameStore.getCurrentGame();
    if (!currentGame) {
      await ctx.reply("No active game to start. Create one with /newgame first!");
      return;
    }

    if (currentGame.cards.length === 0) {
      await ctx.reply("Cannot start game - no cards have been purchased yet!");
      return;
    }

    const game = gameStore.startGame(currentGame.id);
    if (!game) {
      await ctx.reply("Failed to start game. Please try again.");
      return;
    }

    const playersCount = new Set(game.cards.map((c) => c.ownerId)).size;

    await ctx.reply(
      `
🎯 *Game Started!* 🎯

Total Players: ${playersCount}
Total Cards: ${game.cards.length}
Prize Pool: $${game.prizePool.toFixed(2)} 💰

Use /callnumber to call numbers!
The winner takes 90% of the prize pool!

Good luck everyone! 🍀
      `,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("callnumber", adminOnly, async (ctx) => {
    const currentGame = gameStore.getCurrentGame();
    if (!currentGame || currentGame.status !== "in_progress") {
      await ctx.reply("No game in progress. Start a game first with /startgame!");
      return;
    }

    const { number, winner, columnLetter } = gameStore.callNextNumber(currentGame.id);

    if (number === null) {
      await ctx.reply("All numbers have been called! No winner this round.");
      return;
    }

    if (winner) {
      const prize = currentGame.prizePool * 0.9;
      await ctx.reply(
        `
🎉🎉🎉 *BINGO!* 🎉🎉🎉

Number Called: *${columnLetter}-${number}* 🔔

🏆 *WINNER:* @${winner.ownerUsername || `User ${winner.ownerId}`}
💰 *Prize:* $${prize.toFixed(2)}

Congratulations! 🎊

Game has ended. Use /newgame to start a new game!
        `,
        { parse_mode: "Markdown" }
      );
    } else {
      await ctx.reply(
        `
🔔 *Number Called!* 🔔

*${columnLetter}-${number}*

Numbers called: ${currentGame.calledNumbers.length}/75

${currentGame.calledNumbers.length >= 4 ? `Recent: ${currentGame.calledNumbers.slice(-5).map(n => `${getColumnLetter(n)}-${n}`).join(", ")}` : ""}
        `,
        { parse_mode: "Markdown" }
      );
    }
  });

  bot.command("endgame", adminOnly, async (ctx) => {
    const currentGame = gameStore.getCurrentGame();
    if (!currentGame) {
      await ctx.reply("No active game to end.");
      return;
    }

    gameStore.endGame(currentGame.id);
    await ctx.reply("Game has been ended. Refunds will be processed if applicable.");
  });

  bot.command("stats", adminOnly, async (ctx) => {
    const stats = gameStore.getStats();

    await ctx.reply(
      `
📊 *Game Statistics* 📊

Games Played: ${stats.totalGamesPlayed}
Cards Sold: ${stats.totalCardsSold}
Winnings Distributed: $${stats.totalWinningsDistributed.toFixed(2)}
Active Players: ${stats.activePlayers}
Active Games: ${stats.activeGames}
      `,
      { parse_mode: "Markdown" }
    );
  });

  bot.command("admin", adminOnly, async (ctx) => {
    await ctx.reply(
      "🔐 *Admin Dashboard* 🔐\n\nOpen the admin panel to manage games, view stats, and control the bingo bot!",
      {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
          [Markup.button.webApp("🔐 Open Admin Dashboard", `${config.frontendUrl}/admin`)],
        ]),
      }
    );
  });

  // Callback for play_game
  bot.action("play_game", async (ctx) => {
    await ctx.answerCbQuery();
    const currentGame = gameStore.getCurrentGame();

    if (!currentGame) {
      await ctx.reply("No active game right now. Check back soon!");
      return;
    }

    await ctx.reply("Opening game...",
      Markup.inlineKeyboard([
        [Markup.button.webApp("🎮 Play Now!", `${config.frontendUrl}/game`)],
      ])
    );
  });

  bot.action("check_balance", async (ctx) => {
    const userId = ctx.from?.id;
    if (!userId) return;

    const user = gameStore.getUser(userId);
    await ctx.answerCbQuery(`Balance: $${(user?.balance || 0).toFixed(2)}`);
  });

  // Error handling
  bot.catch((err, ctx) => {
    console.error("Bot error:", err);
    ctx.reply("An error occurred. Please try again later.");
  });

  return bot;
};
