import {Context} from "grammy";
import {MESSAGES} from "../../config/constants";
import {MyContext} from "../../index";

import {geolocationKeyboard} from "../../keyboards/reply/geolocation";

export async function handleGeolocation(ctx: MyContext) {
    await ctx.reply(MESSAGES.geolocationRequest, {
        reply_markup: geolocationKeyboard,
    });
}
