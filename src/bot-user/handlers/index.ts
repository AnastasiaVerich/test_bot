import { Bot } from "grammy";

import { ScenesUser } from "../scenes";
import { handleBalance } from "./callback/callback_queries_balance";
import { handleStartCommand } from "./callback/command_start";
import { authMiddleware } from "../middleware/authMiddleware";
import { blacklistMiddleware } from "../middleware/blacklistMiddleware";
import {handler_history_withdrawal} from "./callback/callback_queries_history_withdrawal";
import {handler_history_accrual} from "./callback/callback_queries_history_accrual";
import {checkInitMiddleware} from "../middleware/checkInitMiddleware";
import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";


export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", handleStartCommand);
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
    async (ctx: MyContext) => {
      logger.info("Сессия перед входом в сцену:", ctx.session); // Должно вывести объект
      await ctx.conversation.enter(ScenesUser.RegisterScene);
    },
  );
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(ScenesUser.IdentificationScene);
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(ScenesUser.WithdrawalScene);
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_history_accrual(ctx)
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_history_withdrawal(ctx)
    },
  );
}

export function registerMessage(bot: Bot<MyContext>): void {
  async function catchUserActions(ctx:any){
    const conversationState = await ctx.conversation.active();
    logger.info(`User ${ctx.from?.id} sent text: ${ctx.message.text}, active conversations: ${JSON.stringify(conversationState)}`);

  }

   bot.on("message:text", blacklistMiddleware, authMiddleware,checkInitMiddleware, async (ctx) => {

       if (ctx.message.text === BUTTONS_KEYBOARD.SurveyButton) {
         await ctx.conversation.enter(ScenesUser.SurveyScene);
       } else if (ctx.message.text === BUTTONS_KEYBOARD.InviteButton) {
         await ctx.conversation.enter(ScenesUser.InviteScene);
       } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
         await handleBalance(ctx);
       }
    });
}
