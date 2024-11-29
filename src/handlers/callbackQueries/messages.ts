import { Bot } from "grammy";
import {MyContext} from "../../index";

export function registerMessageHandler(bot: Bot<MyContext>) {
    bot.on("message", async (ctx) => {
        console.log(`${ctx.from.first_name} wrote: ${ctx.message.text || ""}`);
            await ctx.copyMessage(ctx.message.chat.id);
    });
}
