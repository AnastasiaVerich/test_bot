import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {MyContext} from "../../../bot-common/types/type";

export async function handler_help_btns(
    ctx: MyContext,
    text: string,
    keyboard: InlineKeyboard
): Promise<Message.TextMessage | void> {
    try {
        await ctx.editMessageText(text, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    } catch (error: any) {
        // Проверим код ошибки Telegram
        if (error.description?.includes("message can't be edited")) {
            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        } else {
            await ctx.reply("Произошла ошибка при попытке показать информацию.");
        }
    }
}
