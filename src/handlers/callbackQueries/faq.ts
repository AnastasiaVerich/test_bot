import {Context} from "grammy";
import {MESSAGES} from "../../config/constants";
import {FAQMenuKeyboard} from "../../keyboards/inline/faq";
import {MyContext} from "../../index";

export async function handleFaq(ctx: MyContext) {
    await ctx.editMessageText(MESSAGES.secondMenu, {
        reply_markup: FAQMenuKeyboard,
        parse_mode: "HTML",
    });
}
