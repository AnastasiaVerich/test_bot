import {Bot} from "grammy";
import {BUTTONS} from "../../../constants/constants";
import {MyContext} from "../../../types/type";
import {Scenes} from "../../scenes";


// Обработка callback-запросов
export function registerCallbackQueries(bot: Bot<MyContext>) {
    bot.callbackQuery(BUTTONS.RegistrationButton, async (ctx: MyContext) =>{
        await ctx.conversation.enter(Scenes.RegisterScene);
    });
    bot.callbackQuery(BUTTONS.IdentificationButton, async (ctx: MyContext) =>{
        await ctx.conversation.enter(Scenes.PhotoCheckScene);
    });

    bot.callbackQuery(BUTTONS.WithdrawalOfMoneyButton, async (ctx: MyContext) =>{
        await ctx.conversation.enter(Scenes.WithdrawalScene);
    });

}
