import { Bot } from "grammy";
import { SurveyActive, updateActiveSurveyMessageID } from "../../database/queries/surveyQueries";
import { channelId } from "../../config/env";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";

async function processRecord(bot: Bot<MyContext>, record: SurveyActive): Promise<void> {
    const { survey_active_id, created_at } = record;
    const message = `Новый активный опрос!\nСоздан: ${created_at}`;

    try {
        const messageId = await sendMessageWithRetry(bot, channelId, message);
        if (messageId !== null) {
            await updateActiveSurveyMessageID(messageId, survey_active_id);
            logger.info(`Запись ${survey_active_id} обновлена с message_id: ${messageId}`);
        } else {
            logger.info(`Не удалось отправить сообщение для записи ${survey_active_id}`);
        }
    } catch (error) {
        logger.info(`Ошибка при обработке записи ${survey_active_id}:`, error);
    }
}

export async function subscribeNotify(bot: Bot<MyContext>): Promise<void> {
    const query = `
        SELECT survey_active_id, survey_id, user_id, created_at
        FROM survey_active
        WHERE operator_id IS NULL
        AND message_id IS NULL
        ORDER BY created_at ASC
    `;
    await subscribeToChannel(bot, "survey_active_insert", query, processRecord);
}
