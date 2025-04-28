import { Bot } from "grammy";
import { SurveyActive } from "../../database/queries/surveyQueries";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";

async function processRecord(bot: Bot<MyContext>, record: SurveyActive): Promise<void> {
    const { survey_active_id, user_id, link_invite } = record;
    const message = `Вступите в чат для прохождения опроса с оператором: ${link_invite}`;

    try {
        const messageId = await sendMessageWithRetry(bot, user_id, message);
        if (messageId !== null) {
            logger.info(`Сообщение для записи ${survey_active_id} отправлено, message_id: ${messageId}`);
        } else {
            logger.info(`Не удалось отправить сообщение для записи ${survey_active_id}`);
        }
    } catch (error) {
        logger.info(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

export async function subscribeOperatorAssigned(bot: Bot<MyContext>): Promise<void> {
    const query = `
        SELECT survey_active_id, survey_id, user_id, operator_id, created_at, link_invite
        FROM survey_active
        WHERE operator_id IS NOT NULL
        AND is_joined_to_chat IS FALSE
        ORDER BY created_at ASC
    `;
    await subscribeToChannel(bot, "operator_assigned", query, processRecord);
}
