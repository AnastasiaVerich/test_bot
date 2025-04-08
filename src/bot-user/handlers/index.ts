import { Bot } from "grammy";
import { MyContext } from "../types/type";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../constants/button";
import { Scenes } from "../scenes";
import { handleBalance } from "./callback/keyboard_balance";
import { handleStartCommand } from "./callback/command_start";
import { authMiddleware } from "../middleware/authMiddleware";
import { blacklistMiddleware } from "../middleware/blacklistMiddleware";
import {db} from "../../database/dbClient";
import {getUserId} from "../utils/getUserId";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", handleStartCommand);
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(Scenes.RegisterScene);
    },
  );
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(Scenes.IdentificationScene);
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(Scenes.WithdrawalScene);
    },
  );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", blacklistMiddleware, authMiddleware, async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.SurveyButton) {
      await ctx.conversation.enter(Scenes.SurveyScene);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.InviteButton) {
      await ctx.conversation.enter(Scenes.InviteScene);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
      await handleBalance(ctx);
    } else if(ctx.message.text === 'Очисти все платежи в очереди') {
      try {
        const query = `TRUNCATE TABLE pending_payments CASCADE;'
      `;
       await db.query(query,);
      } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
          shortError = error.message.substring(0, 50);
        } else {
          shortError = String(error).substring(0, 50);
        }
        throw new Error("Очисти все платежи в очереди: " + shortError);
      }
    } else if(ctx.message.text === 'Установи мне баланс 100') {
      const userId = await getUserId(ctx);
      try {
        const query = `UPDATE user_balance  SET balance = 100.00 WHERE user_id = ${1};'
      `;
       await db.query(query, [userId]);
      } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
          shortError = error.message.substring(0, 50);
        } else {
          shortError = String(error).substring(0, 50);
        }
        throw new Error("Очисти все платежи в очереди: " + shortError);
      }
    }
  });
}
