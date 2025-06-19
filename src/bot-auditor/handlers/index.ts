import { Bot } from "grammy";
import { handleStartCommand } from "./callback/command_start";

import { MyContext } from "../../bot-common/types/type";
import { cancelAuditorConversation } from "../utils/cancelAuditorConversation";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelAuditorConversation(ctx, true);
    await handleStartCommand(ctx);
  });
  bot.command("clean", (ctx) => cancelAuditorConversation(ctx));
}
