import {MESSAGES} from "../../constants/constants";
import {welcomeKeyboard} from "../../keyboards/inline/welcome";

import {MyContext} from "../../types/type";

export async function handleBack(ctx: MyContext) {
    await ctx.editMessageText(MESSAGES.welcome_new_user, {
        parse_mode: "HTML",
        reply_markup: welcomeKeyboard,
    });
}
