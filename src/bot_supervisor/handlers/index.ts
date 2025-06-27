import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import { handleCommandStartSupervisor } from "./callback/command_start";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesSupervisor } from "../scenes";
import { authSupervisorMiddleware } from "../middleware/authMiddleware";
import { handleCQManualPayment } from "./callback/cq_manual_payment";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handleCQPendingPaymentInfo } from "./callback/cq_pending_payment_info";
import { handleCQGetUserLogs } from "./callback/cq_get_user_logs";
import { handleCQRestartFailedPayments } from "./callback/cq_restart_failed_payments";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { handleChannelPostVideo } from "./callback/channel_post__video";
import { handleCQGetMoneyLogs } from "./callback/cq_get_money_logs";
import { handleCQCancelFailedPayments } from "./callback/cq_cancel_failed_payments";
import {
  LogsInlineKeyboard,
  PaymentsInlineKeyboard,
} from "../../bot-common/keyboards/inlineKeyboard";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", async (ctx) => {
    await cancelConversations(
      ctx,
      ScenesSupervisor,
      AuthSupervisorKeyboard(),
      true,
    );
    await handleCommandStartSupervisor(ctx);
  });
  bot.command("clean", (ctx) =>
    cancelConversations(ctx, ScenesSupervisor, AuthSupervisorKeyboard()),
  );
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.RegistrationButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesSupervisor.RegisterScene);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.GetUsersLogsButton,
      async (ctx: MyContext) => {
        await handleCQGetUserLogs(ctx);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.SwitchPaymentButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesSupervisor.SwitchPaymentType);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.ManualPaymentButton,
      async (ctx: MyContext) => {
        await handleCQManualPayment(ctx);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.RestartFailedPaymentsButton,
      async (ctx: MyContext) => {
        await handleCQRestartFailedPayments(ctx);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.CancelFailedPaymentsButton,
      async (ctx: MyContext) => {
        await handleCQCancelFailedPayments(ctx);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.GetMoneyLogsButton,
      async (ctx: MyContext) => {
        await handleCQGetMoneyLogs(ctx);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisPendingPaymentInfo),
      handleCQPendingPaymentInfo,
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", authSupervisorMiddleware, async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.AddAdvertisingCampaign) {
      await ctx.conversation.enter(
        ScenesSupervisor.AddAdvertisingCampaignScene,
      );
    } else if (ctx.message.text === BUTTONS_KEYBOARD.AddNewSurveys) {
      await ctx.conversation.enter(ScenesSupervisor.AddNewSurveys);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.AddNewOperators) {
      await ctx.conversation.enter(ScenesSupervisor.AddNewOperators);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.GetLogsMenu) {
      await ctx.reply("Выберите логи, которые вам нужны", {
        reply_markup: LogsInlineKeyboard(),
      });
    } else if (ctx.message.text === BUTTONS_KEYBOARD.PaymentsMenu) {
      await ctx.reply("Выберите платежи", {
        reply_markup: PaymentsInlineKeyboard(),
      });
    }
  });
  bot.on("channel_post:video", async (ctx: MyContext) => {
    await handleChannelPostVideo(ctx);
  });
}
