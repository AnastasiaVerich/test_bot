import {Conversation} from "@grammyjs/conversations";
import {MESSAGES} from "../../../constants/constants";
import {OpenWebAppKeyboard} from "../../../keyboards/reply/openWebApp";
import {MyContext} from "../../../types/type";

type resultType = 'user_exist_number'|'user_exist_id'|'user_exist_face'|'success'
export async function stepPhoto(conversation: Conversation<MyContext>, ctx: MyContext, userPhone: string, userId: string) {
    await ctx.reply(MESSAGES.registration_photo, {
        reply_markup: OpenWebAppKeyboard({userPhone, userId, type: 'registration', isSavePhoto: '0'}),
    });

    const message = await conversation.waitFor("message:web_app_data");

    let isSuccess = false
    if (message.message?.web_app_data) {
        const data = JSON.parse(message.message.web_app_data.data);

        const result:resultType = data.result

        switch (result) {
            case'user_exist_number': {
                console.log("Пользователь существует (номер).");
            }
                break
            case'user_exist_id': {
                console.log("Пользователь существует (id).");
            }
                break
            case'user_exist_face': {
                console.log("Пользователь существует (лицо).");
            }
                break
            case'success': {
                console.log("Регистрация проша успешно!");
                isSuccess = true;
            }
                break
        }

        return isSuccess
    } else {
        await ctx.reply(MESSAGES.web_app_data_error);
        return false; // Ошибка, если данные не были получены
    }
}
