import {MESSAGES} from "../../config/constants";
import {welcomeKeyboard} from "../../keyboards/inline/welcome";
import {MyContext} from "../../index";

export async function handleStartCommand(ctx: MyContext) {
    await ctx.reply(
        MESSAGES.welcome,
        {
            parse_mode: "HTML",
            reply_markup: welcomeKeyboard
        }
    );
}
