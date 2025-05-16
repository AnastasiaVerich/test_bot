import { Message } from "grammy/out/types";
import logger from "../../lib/logger";
import { MyContext } from "../../bot-common/types/type";
import { SupervisorSettingKeyboard } from "../../bot-common/keyboards/keyboard";
import { ScenesSupervisor, ScenesSupervisorType } from "../scenes";

export const cancelSupervisorConversation = async (
  ctx: MyContext,
  skipReply: boolean = false,
): Promise<Message.TextMessage | void> => {
  try {
    const activeScenes = Object.keys(
      ctx.conversation.active(),
    ) as ScenesSupervisorType[];

    for (const activeScene of activeScenes) {
      await ctx.conversation.exit(ScenesSupervisor[activeScene]);
    }
    if (skipReply) return;
    if (activeScenes.length > 0) {
      await ctx.reply("Отменено.", {
        reply_markup: SupervisorSettingKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in cancelSupervisorConversation:", error);
  }
};
