import { Bot } from "grammy";

import {MyContext} from "../../types/type";

export function registerMessageHandler(bot: Bot<MyContext>) {
    bot.on("message", async (ctx) => {

    });
}
