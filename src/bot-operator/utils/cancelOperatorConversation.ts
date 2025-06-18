import { Message } from "grammy/out/types";
import logger from "../../lib/logger";
import { MyContext } from "../../bot-common/types/type";
import { AuthOperatorKeyboard } from "../../bot-common/keyboards/keyboard";
import { ScenesOperator, ScenesOperatorType } from "../scenes";

export const cancelOperatorConversation = async (
  ctx: MyContext,
  skipReply: boolean = false,
): Promise<Message.TextMessage | void> => {
  try {
    const activeScenes = Object.keys(
      ctx.conversation.active(),
    ) as ScenesOperatorType[];

    for (const activeScene of activeScenes) {
      await ctx.conversation.exit(ScenesOperator[activeScene]);
    }
    if (skipReply) {
      return ctx.reply("⏳...", {
        reply_markup: {
          remove_keyboard: true, // Удаляет reply-клавиатуру
          inline_keyboard: [], // Удаляет inline-клавиатуру
        },
      });
    }
    if (activeScenes.length > 0) {
      await ctx.reply("Отменено.", {
        reply_markup: AuthOperatorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in cancelOperatorConversation:", error);
  }
};
