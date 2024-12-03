import {Context} from "grammy";
import {MESSAGES} from "../../constants/constants";

import {geolocationKeyboard} from "../../keyboards/reply/geolocation";
import {MyContext} from "../../types/type";

export async function handleGeolocation(ctx: MyContext) {
    await ctx.reply(MESSAGES.geolocationRequest, {
        reply_markup: geolocationKeyboard,
    });
}
