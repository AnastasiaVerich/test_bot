import {Conversation} from "@grammyjs/conversations";
import {MESSAGES} from "../../../constants/constants";
import {OpenWebAppKeyboard} from "../../../keyboards/reply/openWebApp";
import {MyContext} from "../../../types/type";

type resultType = 'user_not_exist'|'success'|'different_face'

export async function stepPhoto(conversation: Conversation<MyContext>, ctx: MyContext, userId: string) {

    await ctx.reply(MESSAGES.identification_photo, {
        reply_markup: OpenWebAppKeyboard({userId, type: 'identification', isSavePhoto: '0'}),
    });

    const message = await conversation.waitFor("message:web_app_data");

    let isSuccess = false
    if (message.message?.web_app_data) {
        const data = JSON.parse(message.message.web_app_data.data);
        const result:resultType = data.result

        switch (result) {
            case'user_not_exist': {
                console.log("Пользователь не существует, в БД нет эмбеддинга по айдишнику.")
                isSuccess =  false;
            }
                break
            case'different_face': {
                console.log("Эмбеддинги не совпали.")
                isSuccess =  false;
            }
                break
            case'success': {
                console.log("Идентификация успешно")
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
