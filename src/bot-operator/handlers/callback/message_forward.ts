import {getUserId} from "../../utils/getUserId";
import {MessageOrigin} from "@grammyjs/types/message";
import {channelId} from "../../../config/env";
import {getActiveSurveyByMessageID, updateActiveSurveyOperatorId} from "../../../database/queries/surveyQueries";
import {findOperator} from "../../../database/queries/operatorQueries";
import {Bot} from "grammy";
import {MESSAGE_OPERATOR_FROWARD} from "../../../bot-common/constants/handler_message";
import {MyContext} from "../../../bot-common/types/type";
import logger from "../../../lib/logger";


export  const handleMessageForward = async (ctx: MyContext,bot: Bot<MyContext>)=>{
    const userId = await getUserId(ctx)
    if(!userId)return
    const forwardOrigin:MessageOrigin | undefined = ctx.message?.forward_origin;
    if (!forwardOrigin) return;

    // Проверка, что сообщение переслано из определенного чата/канала
    if (
        forwardOrigin.type === "channel" &&
        forwardOrigin.chat.id.toString() === channelId
    ) {
        const messageId = forwardOrigin.message_id;
        if(!messageId) return
        const active_survey = await getActiveSurveyByMessageID(messageId)
        if(!active_survey)return

        if(active_survey.operator_id){
            return ctx.reply(MESSAGE_OPERATOR_FROWARD.BUSY)
        }

        const operator = await findOperator(userId,null,null)
        if(!operator|| !operator.telegram_chat_id){
            return
            //что-то придумать.
        }
        const link = await create_link(bot, Number(operator.telegram_chat_id))
        if(!link)return

        await updateActiveSurveyOperatorId(userId,active_survey.survey_active_id, link)

        await ctx.reply(`${MESSAGE_OPERATOR_FROWARD.SUCCESS} `)
        // Удаление сообщения из канала (для всех участников)

        try {
            logger.info(5)
            await bot.api.deleteMessage(channelId, messageId);
            logger.info(`Сообщение ${messageId} удалено из канала ${channelId} для всех`);
        } catch (error: any) {
            logger.info(`Ошибка при удалении сообщения ${messageId}:`, error.message);
            await ctx.reply(
                `Оператор ${userId} назначен, но не удалось удалить сообщение: ${error.message}`
            );
            return;
        }
    }
}
async function create_link(
    bot: Bot<MyContext>,
    chatId: number
) {

    try {
        await bot.init(); // ID бота
        const botId = bot.botInfo.id; // ID бота
        logger.info(chatId)
        const member = await bot.api.getChatMember(chatId, botId);

        if (member.status !== "administrator") {
            //await ctx.reply("У бота нет доступа к вашей группе, напишите в поддержку.!");
            return;
        }
        if (!member.can_invite_users) {
            //await ctx.reply("У бота нет разрешения для приглошения новых пользователей. Напишите в поддержку.");
            return;
        }

        // Создаём одноразовую пригласительную ссылку
        const link = await bot.api.createChatInviteLink(chatId, {
            member_limit: 1, // Ограничиваем до 1 использования
            expire_date: Math.floor(Date.now() / 1000) + 3600, // Ссылка действует 1 час
            name: `One-time link ${new Date().toISOString()}`, // Название ссылки для удобства
        });
        return link.invite_link

    } catch (error) {
        logger.info(error)
        return null;
    }
}
