import { Bot } from "grammy";
import { handleStartCommand } from "./callback/command_start";

import { MyContext } from "../../bot-common/types/type";
import { cancelAuditorConversation } from "../utils/cancelAuditorConversation";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { ScenesAuditor } from "../scenes";

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
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.CheckSurveyByAuditor) {
      await ctx.conversation.enter(ScenesAuditor.CheckSurveyScene);
    }
  });
}
