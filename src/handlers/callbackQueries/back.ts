import {MESSAGES} from "../../config/constants";
import {welcomeKeyboard} from "../../keyboards/inline/welcome";
import {MyContext} from "../../index";

export async function handleBack(ctx: MyContext) {
    await ctx.editMessageText(MESSAGES.welcome, {
        parse_mode: "HTML",
        reply_markup: welcomeKeyboard,
    });
}
