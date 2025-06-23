import { Bot } from "grammy";
import { handleStartCommand } from "./callback/command_start";

import { MyContext } from "../../bot-common/types/type";
import { cancelAuditorConversation } from "../utils/cancelAuditorConversation";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesAuditor } from "../scenes";
import { handleTookAuditSurvey } from "./callback/handle_took_audit_survey";
import { handleBalance } from "./callback/callback_queries_balance";
import { handler_history_accrual } from "./callback/callback_queries_history_accrual";
import { handler_history_withdrawal } from "./callback/callback_queries_history_withdrawal";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelAuditorConversation(ctx, true);
    await handleStartCommand(ctx);
  });
  bot.command("clean", (ctx) => cancelAuditorConversation(ctx));
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.RegistrationButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesAuditor.RegisterScene);
      },
    );

  bot
    .chatType("channel")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.TookAuditButton,
      async (ctx: MyContext) => {
        await handleTookAuditSurvey(ctx, bot);
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesAuditor.WithdrawalScene);
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
      async (ctx: MyContext) => {
        await handler_history_accrual(ctx);
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await handler_history_withdrawal(ctx);
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.chatType("private").on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.CheckSurveyByAuditor) {
      await ctx.conversation.enter(ScenesAuditor.CheckSurveyScene);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
      await handleBalance(ctx);
    }
  });
}
