import {Bot} from "grammy";
import {SurveyActive, updateActiveSurveyIsJoinedToChat} from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import {findOperator} from "../../database/queries/operatorQueries";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";


async function processRecord(bot: Bot<MyContext>, record: SurveyActive): Promise<void> {
    const { survey_active_id, user_id,operator_id, created_at, reservation_end, code_word, tg_account } = record;
    const operator = await findOperator(operator_id,null,null)
    let message = ''
    if(tg_account){
        message =`Напишите оператору: @${operator?.tg_account}.`
    }
    if(code_word){
        message =`Напишите оператору: @${operator?.tg_account}. Отправьте ему кодовую комбинацию <code>${code_word}</code>`
    }
    try {
        const messageId = await sendMessageWithRetry(bot,message,user_id);


        if (messageId !== null) {
            await updateActiveSurveyIsJoinedToChat(true, survey_active_id)

            logger.info(`Сообщение для записи ${survey_active_id} отправлено, message_id: ${messageId}`);
        } else {
            logger.info(`Не удалось отправить сообщение для записи ${survey_active_id}`);
        }
    } catch (error) {
        logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

export async function subscribeOperatorAssigned(bot: Bot<MyContext>): Promise<void> {
    const query = `
        SELECT *
        FROM survey_active
        WHERE operator_id IS NOT NULL
        AND is_user_notified IS FALSE
        ORDER BY created_at ASC
    `;
    await subscribeToChannel(bot, "operator_assigned", query, processRecord);
}
