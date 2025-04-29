import {getUserId} from "../../utils/getUserId";
import {MessageOrigin} from "@grammyjs/types/message";
import {channelId} from "../../../config/env";
import {
    getActiveSurveyByMessageID,
    getSurveyActiveInfo, getSurveyInformations,
    updateActiveSurveyOperatorId
} from "../../../database/queries/surveyQueries";
import {findOperator} from "../../../database/queries/operatorQueries";
import {Bot} from "grammy";
import {MESSAGE_OPERATOR_FROWARD} from "../../../bot-common/constants/handler_message";
import {MyContext} from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import {FinishSurveyKeyboard} from "../../../bot-common/keyboards/inlineKeyboard";


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
        if(!active_survey) return

        if(active_survey.operator_id){
            return ctx.reply(MESSAGE_OPERATOR_FROWARD.BUSY)
        }

        const operator = await findOperator(userId,null,null)
        if(!operator){
            return
            //что-то придумать.
        }

        await updateActiveSurveyOperatorId(userId,active_survey.survey_active_id)

        await ctx.reply(`${MESSAGE_OPERATOR_FROWARD.SUCCESS}`)
        const surveyActive = await getSurveyActiveInfo(active_survey.survey_active_id)
        const surveyActiveTasks = await getSurveyInformations(active_survey.survey_id)


        if(!surveyActive)return
        let message = [
            `<b>📋 Опрос</b>`,
            //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
            //`<b>Тип:</b> ${surveyActive.survey_type}`,
            //`<b>Описание:</b> ${surveyActive.description}`,
            `<b>Геолокация:</b> ${surveyActive.region_name}`,
            `<b>Цена за задание:</b> ${surveyActive.task_price}`,
            `<b>Время резерва:</b> ${surveyActive.reservation_time_min} мин`,
            `` // Empty line for spacing
        ].join('\n');

        message += '\n\n<b>📝 Информация:</b>\n';
        surveyActiveTasks.forEach((task, index) => {
            message += `<b>${task.label}:</b> ${task.description}\n`;
        });
        await ctx.reply(`${message}`, {parse_mode:'HTML'})

        await ctx.reply('После окончания опроса нажми на кнопку завершения.',
            {reply_markup:FinishSurveyKeyboard()})

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
