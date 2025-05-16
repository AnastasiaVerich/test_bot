import {Bot} from "grammy";
import {MyContext} from "../../bot-common/types/type";
import {handleStartCommand} from "./command_start";
import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {ScenesSupervisor} from "../scenes";
import {authSupervisorMiddleware} from "../middleware/authMiddleware";

export function registerCommands(bot: Bot<MyContext>): void {
    bot.command("start", handleStartCommand);
}
export function registerCallbackQueries(bot: Bot<MyContext>): void {
    bot.chatType("private").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.RegistrationButton,
        async (ctx: MyContext) => {
            await ctx.conversation.enter(ScenesSupervisor.RegisterScene);
        },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {

    bot.on("message:text", authSupervisorMiddleware, async (ctx) => {

        if (ctx.message.text === BUTTONS_KEYBOARD.AddAdvertisingCampaign) {
            await ctx.conversation.enter(ScenesSupervisor.AddAdvertisingCampaignScene);
        }
    });
}
