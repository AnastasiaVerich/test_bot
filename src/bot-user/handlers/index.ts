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
import {handler_history_withdrawal_balance} from "./callback/keyboard_history_withdrawal_balance";
import {handler_history_input_balance} from "./callback/keyboard_history_input_balance";


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

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_history_input_balance(ctx)
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_history_withdrawal_balance(ctx)
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
    }
  });
}
