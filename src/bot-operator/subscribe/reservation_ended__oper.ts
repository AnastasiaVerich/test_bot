import {Bot} from "grammy";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import {cancelTakeSurveyByUser} from "../../database/services/surveyService";
import {SurveyActiveType} from "../../database/db-types";


async function processRecord(bot: Bot<MyContext>, record: SurveyActiveType): Promise<void> {
    const {survey_active_id, survey_id, user_id, operator_id, created_at, tg_account, code_word} = record;
    let message = `Время резервации вышло для пользователя `

    if (tg_account) {
        message += '@' + tg_account + '.'
    }
    if (code_word) {
        message += 'с кодовым словом ' + code_word + '.'
    }
    try {
        if (operator_id) {
            const messageId = await sendMessageWithRetry(bot, message, operator_id);

            if (messageId !== null) {
                await cancelTakeSurveyByUser(survey_active_id, survey_id)


            } else {
                logger.error(`Не удалось отправить сообщение для записи ${survey_active_id}`);
            }
        } else {
            await cancelTakeSurveyByUser(survey_active_id, survey_id)

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
