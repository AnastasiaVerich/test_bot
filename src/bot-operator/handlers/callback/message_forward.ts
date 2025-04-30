import {MessageOrigin} from "@grammyjs/types/message";
import {channelId} from "../../../config/env";
import {Bot} from "grammy";
import {MyContext} from "../../../bot-common/types/type";
import {ScenesOperator} from "../../scenes";


export const handleMessageForward = async (ctx: MyContext, bot: Bot<MyContext>) => {
    const forwardOrigin: MessageOrigin | undefined = ctx.message?.forward_origin;
    if (!forwardOrigin) return;

    // Проверка, что сообщение переслано из определенного чата/канала
    if (
        forwardOrigin.type === "channel" &&
        forwardOrigin.chat.id.toString() === channelId
    ) {

        const message_id = forwardOrigin.message_id;
        if (!message_id) return
        await ctx.conversation.enter(ScenesOperator.StartSurveyScene, {
            state: {message_id:message_id},
        });
    }
}
