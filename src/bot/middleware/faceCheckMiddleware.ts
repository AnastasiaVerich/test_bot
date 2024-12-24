import {Conversation} from "@grammyjs/conversations";
import {Keyboard} from "grammy";
import {MyContext} from "../types/type";
import {WEB_APP_URL} from "../../config/env";
import {BUTTONS_KEYBOARD} from "../constants/button";
import {MESSAGES} from "../constants/messages";



export async function faceCheckMiddleware(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id
    let isSuccess = false

    // Проверяем фото пользователя
    await ctx.reply(MESSAGES.VERIFY_BY_PHOTO, {
        reply_markup: new Keyboard()
            .webApp(BUTTONS_KEYBOARD.OpenAppButton, `${WEB_APP_URL}?data=${encodeURIComponent(JSON.stringify({
                userId,
                type: 'identification',
                isSavePhoto: '0'
            }))}`)
            .resized(),
    });

    const message_web_app_data = await conversation.waitFor("message:web_app_data");

    if (message_web_app_data.message?.web_app_data) {
        const data = JSON.parse(message_web_app_data.message.web_app_data.data);

        if(data.text === 'success'){
            isSuccess = true
        }
    }

    return isSuccess
}
