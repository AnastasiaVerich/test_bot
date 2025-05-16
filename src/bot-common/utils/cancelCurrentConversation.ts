import {MyContext} from "../types/type";
import {Message} from "grammy/out/types";
import logger from "../../lib/logger";
import {ScenesSupervisor, ScenesSupervisorType} from "../../bot_supervisor/scenes";
import {InlineKeyboard, Keyboard} from "grammy";

export const cancelCurrentConversation = async (
    ctx: MyContext,
    defaultMenu: Keyboard | InlineKeyboard
): Promise<Message.TextMessage | void> => {
    try {
        const activeScenes = Object.keys(ctx.conversation.active()) as ScenesSupervisorType[]
        for (const activeScene of activeScenes) {
            await ctx.conversation.exit(ScenesSupervisor[activeScene]);
        }
        if (activeScenes.length > 0) {
            await ctx.reply('Отменено.', {
                reply_markup: defaultMenu
            })
        }
    } catch (error) {
        logger.error('Error in cancelCurrentConversation:', error)
    }
};
