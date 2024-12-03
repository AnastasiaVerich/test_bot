import {Conversation} from "@grammyjs/conversations";
import {stepPhone} from "./steps/phone";
import {stepPhoto} from "./steps/photo";
import {MyContext} from "../../types/type";
import {MESSAGES} from "../../constants/constants";


export async function registrationScene(conversation: Conversation<MyContext>, ctx: MyContext) {

    // Шаг 1: Ожидаем номер телефона
    const {
        userPhone,
    } = await stepPhone(conversation, ctx);
    const userId =  ctx.from?.id?? ''

    // Шаг 2: Ожидаем фото
    const photoAccepted = await stepPhoto(conversation, ctx,userPhone,userId.toString());
    if (!photoAccepted) {
        await ctx.reply(MESSAGES.registration_error);
        return;  // Если фото не принято, завершаем сценарий
    }
    // Завершаем сцену
    await ctx.reply(MESSAGES.registration_success);
}
