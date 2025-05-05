import {Bot} from "grammy";
import {SurveyActive, updateActiveSurveyIsJoinedToChat} from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import {findOperator} from "../../database/queries/operatorQueries";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";



async function processRecord(bot: Bot<MyContext>, record: SurveyActive): Promise<void> {
    const { survey_active_id, user_id,operator_id, created_at } = record;
    const operator = await findOperator(operator_id,null,null)
    const message =`Время резервации вышло`
    try {
        const messageId = await sendMessageWithRetry(bot,message,user_id);

        if (messageId !== null) {
            logger.info(`Сообщение для записи ${survey_active_id} отправлено, message_id: ${messageId}`);
        } else {
            logger.error(`Не удалось отправить сообщение для записи ${survey_active_id}`);
        }
    } catch (error) {
        logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

export async function subscribeReservationEnded(bot: Bot<MyContext>): Promise<void> {
    const query = `
        SELECT *
        FROM survey_active
        WHERE is_reservation_end IS TRUE
    `;
    await subscribeToChannel(bot, "reservation_ended", query, processRecord);
}
