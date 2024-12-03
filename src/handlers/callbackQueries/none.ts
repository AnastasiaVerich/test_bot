import {MESSAGES} from "../../constants/constants";

import {backKeyboard} from "../../keyboards/inline/back";

import {MyContext} from "../../types/type";

export async function handleNone(ctx: MyContext) {
    if (ctx.callbackQuery?.message?.message_id){
        await ctx.editMessageText(
            MESSAGES.none,
            {
                reply_markup: backKeyboard,
            }
        );
    } else {
        await ctx.reply(
            MESSAGES.none,
            {
                reply_markup: backKeyboard,
            }
        );
    }

}
