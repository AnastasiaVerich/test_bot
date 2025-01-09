import {Conversation} from "@grammyjs/conversations";
import {MyContext} from "../types/type";
import {Keyboard} from "grammy";
import {WEB_APP_URL} from "../../config/env";
import {AuthUserKeyboard} from "../keyboards/AuthUserKeyboard";
import {REGISTRATION_SCENE} from "../constants/scenes";
import {BUTTONS_KEYBOARD} from "../constants/button";
import {RegistrationResponseText} from "../../config/common_types";


export async function registrationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    const userId = ctx.from?.id ?? ''

    // Шаг 1: Ожидаем номер телефона
    await ctx.reply(REGISTRATION_SCENE.INPUT_PHONE, {
        parse_mode: "HTML", // Указываем, что текст содержит HTML
        reply_markup: new Keyboard()
            .requestContact(BUTTONS_KEYBOARD.SendNumberButton)
            .resized()
            .oneTime(),
    });

    const message = await conversation.waitFor("message:contact");

    const userPhone = message.message?.contact?.phone_number


    // Шаг 2: Проверяем фото пользователя
    await ctx.reply(REGISTRATION_SCENE.VERIFY_BY_PHOTO, {
        reply_markup: new Keyboard()
            .webApp(BUTTONS_KEYBOARD.OpenAppButton, `${WEB_APP_URL}?data=${encodeURIComponent(JSON.stringify({
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

        const text:RegistrationResponseText = data.text
        console.log(data)

        switch (text) {
            case'user_exist_number':
            case'user_exist_id':
            case'user_exist_face': {
                await ctx.reply(REGISTRATION_SCENE.USER_EXIST);
                console.log("Пользователь существует (номер)." + text);
            }
                break
            case'user_is_block': {
                await ctx.reply(REGISTRATION_SCENE.USER_IN_BLOCK);
                console.log("Пользователь заблокирован.");
            }
                break
            case'success': {
                await ctx.reply(REGISTRATION_SCENE.SUCCESS,{
                    reply_markup:AuthUserKeyboard()
                });
                console.log("Регистрация проша успешно!");
            }
                break
            default: {
                console.log(data.text)
                await ctx.reply(REGISTRATION_SCENE.FAILED);
            }
        }
    } else {
        await ctx.reply(REGISTRATION_SCENE.FAILED);
    }
}
