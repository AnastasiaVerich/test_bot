import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import { handleStartCommand } from "./command_start";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesSupervisor } from "../scenes";
import { authSupervisorMiddleware } from "../middleware/authMiddleware";
import { handleManualPayment } from "./mess_manual_payment";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handlePendingPaymentInfo } from "./callback_queries_pending_payment_info";
import { handleGetUserLogs } from "./mess_get_user_logs";
import { handleRestartFailedPayments } from "../../bot-operator/handlers/callback/mess_restart_failed_payments";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", async (ctx) => {
    await cancelConversations(
      ctx,
      ScenesSupervisor,
      AuthSupervisorKeyboard(),
      true,
    );
    await handleStartCommand(ctx);
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
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisPendingPaymentInfo),
      handlePendingPaymentInfo,
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
    } else if (ctx.message.text === BUTTONS_KEYBOARD.GetUsersLogs) {
      await handleGetUserLogs(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.AddNewOperators) {
      await ctx.conversation.enter(ScenesSupervisor.AddNewOperators);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.SwitchPaymentType) {
      await ctx.conversation.enter(ScenesSupervisor.SwitchPaymentType);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.ManualPayment) {
      await handleManualPayment(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.RestartFailedPayments) {
      await handleRestartFailedPayments(ctx);
    }
  });
}
