import {Conversation} from "@grammyjs/conversations";
import {stepPhoto} from "./steps/by_photo";
import {MyContext} from "../../types/type";
import {MESSAGES} from "../../constants/constants";


export async function identificationScene(conversation: Conversation<MyContext>, ctx: MyContext) {


    const userId =  ctx.from?.id?? ''
    // Шаг 1
    const photoAccepted = await stepPhoto(conversation, ctx,userId.toString());
    if (!photoAccepted) {
        await ctx.reply(MESSAGES.identification_error);
        return;  // Завершаем сценарий
    }
    // Завершаем сцену
    await ctx.reply(MESSAGES.identification_success);
}
