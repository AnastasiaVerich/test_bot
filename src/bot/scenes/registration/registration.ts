import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../../../types/type";
import {Keyboard} from "grammy";
import {WEB_APP_URL} from "../../../config/config";
import {
    INPUT_PHONE,
    OPEN_WEB_APP_BTN, REGISTRATION_SUCCESS,
    SEND_NUMBER_BTN,
    SOME_ERROR,
    USER_EXIST,
    USER_IN_BLOCK,
    VERIFY_BY_PHOTO
} from "./constants";
import {MainMenuKeyboard} from "../../keyboards/mainMenuKeyboard";


export async function registrationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id ?? ''

    // Шаг 1: Ожидаем номер телефона
    await ctx.reply(INPUT_PHONE, {
        reply_markup: new Keyboard()
            .requestContact(SEND_NUMBER_BTN)
            .resized()
            .oneTime(),
    });

    const message = await conversation.waitFor("message:contact");

    const userPhone = message.message?.contact?.phone_number


    // Шаг 2: Проверяем фото пользователя
    await ctx.reply(VERIFY_BY_PHOTO, {
        reply_markup: new Keyboard()
            .webApp(OPEN_WEB_APP_BTN, `${WEB_APP_URL}?data=${encodeURIComponent(JSON.stringify({
                userPhone,
                userId,
                type: 'registration',
                isSavePhoto: '0'
            }))}`)
            .resized(),
    });

    const message_web_app_data = await conversation.waitFor("message:web_app_data");

    if (message_web_app_data.message?.web_app_data) {
        const data = JSON.parse(message_web_app_data.message.web_app_data.data);
        console.log(data)
        switch (data.text) {
            case'user_exist_number': {
                await ctx.reply(USER_EXIST);
                console.log("Пользователь существует (номер).");
            }
                break
            case'user_exist_id': {
                await ctx.reply(USER_EXIST);
                console.log("Пользователь существует (id).");
            }
                break
            case'user_exist_face': {
                await ctx.reply(USER_EXIST);
                console.log("Пользователь существует (лицо).");
            }
                break
            case'user_is_block': {
                await ctx.reply(USER_IN_BLOCK);
                console.log("Пользователь заблокирован.");
            }
                break
            case'success': {
                await ctx.reply(REGISTRATION_SUCCESS,{
                    reply_markup:MainMenuKeyboard()
                });
                console.log("Регистрация проша успешно!");
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
