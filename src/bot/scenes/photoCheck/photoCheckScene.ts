import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../../../types/type";
import {Keyboard} from "grammy";
import {WEB_APP_URL} from "../../../config/config";
import {OPEN_WEB_APP_BTN, SOME_ERROR, USER_IN_BLOCK, VERIFY_BY_PHOTO, VERIFY_FAILED, VERIFY_SUCCESS} from "./constants";
import {MainMenuKeyboard} from "../../keyboards/mainMenuKeyboard";


export async function photoCheckScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id ?? ''

    // Проверяем фото пользователя
    await ctx.reply(VERIFY_BY_PHOTO, {
        reply_markup: new Keyboard()
            .webApp(OPEN_WEB_APP_BTN, `${WEB_APP_URL}?data=${encodeURIComponent(JSON.stringify({
                userId,
                type: 'identification',
                isSavePhoto: '0'
            }))}`)
            .resized(),
    });

    const message_web_app_data = await conversation.waitFor("message:web_app_data");

    if (message_web_app_data.message?.web_app_data) {
        const data = JSON.parse(message_web_app_data.message.web_app_data.data);
        console.log(data)
        switch (data.text) {
            case'similarity_not_confirmed': {
                await ctx.reply(VERIFY_FAILED);
            }
                break
            case'user_is_block': {
                await ctx.reply(USER_IN_BLOCK);
                console.log("Пользователь заблокирован.");
            }
                break
            case'success': {
                await ctx.reply(VERIFY_SUCCESS,{
                    reply_markup:MainMenuKeyboard()
                });
                console.log("Верификация проша успешно!");
            }
                break
            default: {
                console.log(data.text)
                await ctx.reply(SOME_ERROR);
            }
        }
    } else {
        await ctx.reply(SOME_ERROR);
    }
}
