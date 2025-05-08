import {Bot} from "grammy";
import {deleteSurveyInActive, SurveyActive} from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import {findOperator} from "../../database/queries/operatorQueries";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";


async function processRecord(bot: Bot<MyContext>, record: SurveyActive): Promise<void> {
    const {survey_active_id, user_id, operator_id, created_at,tg_account, code_word} = record;
    let message = `Время резервации вышло для пользователя `

    if(tg_account){
        message += '@'+tg_account+'.'
    }
    if(code_word){
        message += 'с кодовым словом '+code_word+'.'
    }
    try {
        const messageId = await sendMessageWithRetry(bot, message, operator_id);

        if (messageId !== null) {
            await deleteSurveyInActive(survey_active_id)

            logger.info(`Сообщение для записи ${survey_active_id} отправлено, message_id: ${messageId}`);
        } else {
            logger.error(`Не удалось отправить сообщение для записи ${survey_active_id}`);
        }
    } catch (error) {
        logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

export async function subscribeReservationEndedOper(bot: Bot<MyContext>): Promise<void> {
    const query = `
        SELECT *
        FROM survey_active
        WHERE is_reservation_end IS TRUE
    `;
    await subscribeToChannel(bot, "reservation_ended", query, processRecord);
}
