import {channelId} from "../../../config/env";
import {Bot} from "grammy";
import {MyContext} from "../../../bot-common/types/type";
import {
    getActiveSurveyByMessageID, getActiveSurveyByOperatorId,
    getSurveyActiveInfo,
    updateActiveSurveyOperatorId
} from "../../../database/queries/surveyQueries";
import {findOperator} from "../../../database/queries/operatorQueries";
import {IsUserWriteKeyboard} from "../../../bot-common/keyboards/inlineKeyboard";
import {HANDLER_TOOK_SURVEY} from "../../../bot-common/constants/handler_callback_queries";
import logger from "../../../lib/logger";


export const handleTookSurvey = async (ctx: MyContext, bot: Bot<MyContext>) => {
    try {
        const message_id = ctx.update.callback_query?.message?.message_id
        const chat_id = ctx.update.callback_query?.message?.chat.id
        const operator_id = ctx.update.callback_query?.from?.id
        if (!message_id || !chat_id || !operator_id) return
        // Проверка, что сообщение переслано из определенного чата/канала
        if (
            chat_id.toString() === channelId
        ) {
            const operator = await findOperator(operator_id, null, null)
            if (!operator) return

            if(!operator.can_take_multiple_surveys){
                const hasActiveSurvey = await getActiveSurveyByOperatorId(operator_id)
                if(hasActiveSurvey) return
            }
            const active_survey = await getActiveSurveyByMessageID(message_id)
            if (!active_survey) return

            const surveyActiveInfo = await getSurveyActiveInfo(active_survey.survey_active_id)
            if (!surveyActiveInfo) return

            if (active_survey.operator_id) return

            const updatingSurveyActive = await updateActiveSurveyOperatorId(operator_id, active_survey.survey_active_id, surveyActiveInfo.reservation_time_min)

            if (updatingSurveyActive?.operator_id.toString() === operator_id.toString()) {

                await ctx.api.deleteMessage(channelId, message_id);
                let messages = ''
                if (updatingSurveyActive.tg_account) {
                    messages = `${HANDLER_TOOK_SURVEY.TOOK_IT__NOW_TG_ACC}`
                        .replace("{tg_account}", updatingSurveyActive.tg_account)

                }
                if (updatingSurveyActive.code_word) {
                    messages = `${HANDLER_TOOK_SURVEY.TOOK_IT__NOW_CODE_WORD} <b>${updatingSurveyActive.code_word}</b>. `
                }

                messages += '\n'+HANDLER_TOOK_SURVEY.CONFIRMATION
                    .replace("{res_time}", `${surveyActiveInfo.reservation_time_min} мин`)
                await bot.api.sendMessage(operator_id, messages, {
                    parse_mode: 'HTML',
                    reply_markup: IsUserWriteKeyboard(),
                })
            }
        }
    } catch (error) {
        logger.error("Error in handleTookSurvey: " + error);
        await ctx.reply(HANDLER_TOOK_SURVEY.SOME_ERROR);
    }
}
