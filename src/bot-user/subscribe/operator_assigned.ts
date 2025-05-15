import {Bot} from "grammy";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import {getOperatorByIdPhoneOrTg} from "../../database/queries_kysely/operators";
import {updateActiveSurvey} from "../../database/queries_kysely/survey_active";
import {SurveyActiveType} from "../../database/db-types";


async function processRecord(bot: Bot<MyContext>, record: SurveyActiveType): Promise<void> {
    const {survey_active_id, user_id, operator_id, created_at, reservation_end, code_word, tg_account} = record;
    if(!operator_id)return
    const operator = await getOperatorByIdPhoneOrTg({operator_id: operator_id})
    let message = ''
    if (tg_account) {
        message = `Напишите оператору: @${operator?.tg_account}.`
    }
    if (code_word) {
        message = `Напишите оператору: @${operator?.tg_account}. Отправьте ему кодовую комбинацию <code>${code_word}</code>`
    }
    try {
        const messageId = await sendMessageWithRetry(bot, message, user_id);


        if (messageId !== null) {
            const resUpdate = await updateActiveSurvey(survey_active_id, {isUserNotified: true})
            if (!resUpdate) {
                logger.info(`Не удалось обновить  isUserNotified для записи ${survey_active_id}`);

            }
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
