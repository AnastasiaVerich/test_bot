import { Bot } from "grammy";
import { handleCommandStartAuditor } from "./callback/command_start";

import { MyContext } from "../../bot-common/types/type";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesAuditor } from "../scenes";
import { handleCQTookAuditSurvey } from "./callback/cq_took_audit_survey";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthAuditorKeyboard } from "../../bot-common/keyboards/keyboard";
import { handleChannelPostVideo } from "./callback/channel_post__video";
import { handleMessageBalance } from "../../bot-common/handlers_callback/message__balance";
import { handlerCQHistoryWithdrawal } from "../../bot-common/handlers_callback/cq_history_withdrawal";
import { handleCQHistoryAccrual } from "../../bot-common/handlers_callback/cq_history_accrual";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelConversations(ctx, ScenesAuditor, AuthAuditorKeyboard(), true);
    await handleCommandStartAuditor(ctx);
  });
  bot.command("clean", (ctx) =>
    cancelConversations(ctx, ScenesAuditor, AuthAuditorKeyboard()),
  );
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
        await handleCQTookAuditSurvey(ctx, bot);
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
        await handleCQHistoryAccrual(ctx, "auditor");
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await handlerCQHistoryWithdrawal(ctx, "auditor");
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.chatType("private").on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.CheckSurveyByAuditor) {
      await ctx.conversation.enter(ScenesAuditor.CheckSurveyScene);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
      await handleMessageBalance(ctx, "auditor");
    }
  });
  bot.on("channel_post:video", async (ctx: MyContext) => {
    await handleChannelPostVideo(ctx);
  });
}
