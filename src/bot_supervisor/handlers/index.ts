import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import { handleCommandStartSupervisor } from "./callback/command_start";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesSupervisor } from "../scenes";
import { authSupervisorMiddleware } from "../middleware/authMiddleware";
import { handleMessageManualPayment } from "./callback/message_manual_payment";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handleCQPendingPaymentInfo } from "./callback/cq_pending_payment_info";
import { handleMessageGetUserLogs } from "./callback/message_get_user_logs";
import { handleMessageRestartFailedPayments } from "../../bot-operator/handlers/callback/message_restart_failed_payments";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { handleChannelPostVideo } from "./callback/channel_post__video";
import { handleMessageGetMoneyLogs } from "./callback/message_get_money_logs";

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
    } else if (ctx.message.text === BUTTONS_KEYBOARD.GetUsersLogs) {
      await handleMessageGetUserLogs(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.GetMoneyLogs) {
      await handleMessageGetMoneyLogs(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.AddNewOperators) {
      await ctx.conversation.enter(ScenesSupervisor.AddNewOperators);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.SwitchPaymentType) {
      await ctx.conversation.enter(ScenesSupervisor.SwitchPaymentType);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.ManualPayment) {
      await handleMessageManualPayment(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.RestartFailedPayments) {
      await handleMessageRestartFailedPayments(ctx);
    }
  });
  bot.on("channel_post:video", async (ctx: MyContext) => {
    await handleChannelPostVideo(ctx);
  });
}
