import {Conversation} from "@grammyjs/conversations";
import {Keyboard} from "grammy";
import {MyContext} from "../types/type";
import {WEB_APP_URL} from "../../config/env";
import {BUTTONS_KEYBOARD} from "../constants/button";
import {MESSAGES} from "../constants/messages";
import {IdentificationResponseText} from "../../config/common_types";
import {updateUserLastInit} from "../../database/queries/userQueries";


export async function faceCheckMiddleware(conversation: Conversation<MyContext>, ctx: MyContext): Promise<{
    isSuccess: boolean
    text: IdentificationResponseText
}> {

    const userId = ctx.from?.id
    let isSuccess = false
    let text: IdentificationResponseText = 'server_error'
    if (!userId) {
        await ctx.reply(MESSAGES.USER_ID_UNDEFINED);
        return {isSuccess, text}
    }
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
        const data = await JSON.parse(message_web_app_data.message.web_app_data.data);
        text = data.text

        if (data.text === 'success') {
            await updateUserLastInit(userId)
            isSuccess = true
        }
    }

    return {isSuccess, text}
}
