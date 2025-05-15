import {Bot} from "grammy";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import {getOperatorByIdPhoneOrTg} from "../../database/queries_kysely/operators";
import {SurveyActiveType} from "../../database/db-types";


async function processRecord(bot: Bot<MyContext>, record: SurveyActiveType): Promise<void> {
    const { survey_active_id, user_id,operator_id, created_at } = record;
    if(!operator_id) return
    const operator = await getOperatorByIdPhoneOrTg({operator_id:operator_id})
    const message =`Время резервации вышло`
    try {
        const messageId = await sendMessageWithRetry(bot,message,user_id);

        if (messageId !== null) {
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
