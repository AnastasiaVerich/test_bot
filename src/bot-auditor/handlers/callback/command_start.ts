import { Message } from "grammy/types";
import { COMMAND_AUDITOR_START } from "../../../bot-common/constants/handler_command";
import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    return ctx.reply("Приветик", {
      reply_markup: AuthOperatorKeyboard(),
    });
  } catch (error) {
    logger.info(error);
    return ctx.reply(COMMAND_AUDITOR_START.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
