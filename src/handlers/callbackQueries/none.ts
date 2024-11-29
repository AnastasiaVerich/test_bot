import {MESSAGES} from "../../config/constants";

import {backKeyboard} from "../../keyboards/inline/back";
import {MyContext} from "../../index";

export async function handleNone(ctx: MyContext) {
    await ctx.reply(
        MESSAGES.none,
        {
            reply_markup: backKeyboard,
        }
    );
}
