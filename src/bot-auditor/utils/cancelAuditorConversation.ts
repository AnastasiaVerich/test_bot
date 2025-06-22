import { Message } from "grammy/out/types";
import logger from "../../lib/logger";
import { MyContext } from "../../bot-common/types/type";
import { AuthAuditorKeyboard } from "../../bot-common/keyboards/keyboard";
import { ScenesAuditor, ScenesAuditorType } from "../scenes";

export const cancelAuditorConversation = async (
  ctx: MyContext,
  skipReply: boolean = false,
): Promise<Message.TextMessage | void> => {
  try {
    const activeScenes = Object.keys(
      ctx.conversation.active(),
    ) as ScenesAuditorType[];

    for (const activeScene of activeScenes) {
      await ctx.conversation.exit(ScenesAuditor[activeScene]);
    }
    if (skipReply && activeScenes.length > 0) {
      return ctx.reply("⏳...", {
        reply_markup: {
          remove_keyboard: true, // Удаляет reply-клавиатуру
          inline_keyboard: [], // Удаляет inline-клавиатуру
        },
      });
    }
    if (activeScenes.length > 0) {
      await ctx.reply("Отменено.", {
        reply_markup: AuthAuditorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in cancelAuditorConversation:", error);
  }
};
