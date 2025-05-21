import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import { handleStartCommand } from "./command_start";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesSupervisor } from "../scenes";
import { authSupervisorMiddleware } from "../middleware/authMiddleware";
import { cancelSupervisorConversation } from "../utils/cancelSupervisorConversation";
import { handleManualPayment } from "./mess_manual_payment";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handlePendingPaymentInfo } from "./callback_queries_pending_payment_info";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", async (ctx) => {
    await cancelSupervisorConversation(ctx, true);
    await handleStartCommand(ctx);
  });
  bot.command("clean", (ctx) => cancelSupervisorConversation(ctx));
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
    } else if (ctx.message.text === BUTTONS_KEYBOARD.SwitchPaymentType) {
      await ctx.conversation.enter(ScenesSupervisor.SwitchPaymentType);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.ManualPayment) {
      await handleManualPayment(ctx);

      //await ctx.conversation.enter(ScenesSupervisor.ManualPayment);
    }
  });
}
