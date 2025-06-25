import { Message } from "grammy/out/types";
import { Keyboard } from "grammy";
import logger from "../../lib/logger";
import { MyContext } from "../types/type";
import { RESPONSES } from "../constants/responses";

export const cancelConversations = async (
  ctx: MyContext,
  Scenes: any,
  ShowKeyboard: Keyboard,
  skipReply: boolean = false,
): Promise<Message.TextMessage | void> => {
  type ScenesType = (typeof Scenes)[keyof typeof Scenes];
  try {
    const activeScenes = Object.keys(ctx.conversation.active()) as ScenesType[];

    for (const activeScene of activeScenes) {
      await ctx.conversation.exit(Scenes[activeScene]);
    }
    if (skipReply && activeScenes.length > 0) {
      return ctx.reply(RESPONSES.WAITING, {
        reply_markup: {
          remove_keyboard: true, // Удаляет reply-клавиатуру
          inline_keyboard: [], // Удаляет inline-клавиатуру
        },
      });
    }
    if (activeScenes.length > 0) {
      await ctx.reply(RESPONSES.CANCELLED, {
        reply_markup: ShowKeyboard,
      });
    }
  } catch (error) {
    logger.error("Error in cancelAuditorConversation:", error);
  }
};
