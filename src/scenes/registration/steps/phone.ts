import {Conversation} from "@grammyjs/conversations";
import {MESSAGES} from "../../../constants/constants";
import {SendContactKeyboard} from "../../../keyboards/reply/sendContact";
import {MyContext} from "../../../types/type";


export async function stepPhone(conversation: Conversation<MyContext>, ctx: MyContext) {
    await ctx.reply(MESSAGES.registration_number, {
        reply_markup: SendContactKeyboard,
    });


    const message = await conversation.waitFor("message:contact");
    const userPhone = message.message?.contact?.phone_number

    return {
        userPhone,
    }
}
