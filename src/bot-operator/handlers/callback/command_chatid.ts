import {Message} from "grammy/types";
import {COMMAND_CHAT_ID} from "../../../bot-common/constants/handler_command";
import {MyContext} from "../../../bot-common/types/type";
import logger from "../../../lib/logger";

export const handleChatidCommand = async (
    ctx: MyContext,
): Promise<Message.TextMessage | void> => {
    try {
        const chatId = ctx?.chat?.id.toString() ?? '-';
        return ctx.reply(chatId)

    } catch (error) {
        logger.info(error)
        return ctx.reply(COMMAND_CHAT_ID.SOME_ERROR, {
            reply_markup: { remove_keyboard: true },
        });
    }
};
