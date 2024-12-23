import {Bot} from "grammy";

import {MyContext} from "../../../types/type";
import {BUTTONS} from "../../../constants/constants";
import {Scenes} from "../../scenes";
import {handleBalance} from "./callback/balance";


// Обработка callback-запросов
export function registerMessage(bot: Bot<MyContext>) {

    bot.on('message:text', async (ctx) => {
        if (ctx.message.text === BUTTONS.SurveyButtonText) {
            await ctx.conversation.enter(Scenes.SurveyScene);
        } else if (ctx.message.text === BUTTONS.InviteButtonText) {
            await ctx.conversation.enter(Scenes.InviteScene);
        } else if (ctx.message.text === BUTTONS.BalanceButtonText) {
            await handleBalance(ctx)
        }
    });
}
