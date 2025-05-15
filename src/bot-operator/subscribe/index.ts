import {Bot} from "grammy";
import {channelId} from "../../config/env";
import {MyContext} from "../../bot-common/types/type";
import {sendMessageWithRetry, subscribeToChannel} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import {TookKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {updateActiveSurvey} from "../../database/queries_kysely/survey_active";
import {SurveyActiveType} from "../../database/db-types";

async function processRecord(bot: Bot<MyContext>, record: SurveyActiveType): Promise<void> {
    const { survey_active_id, created_at } = record;
    const message = `Новый активный опрос!\nСоздан: ${created_at}`;

    try {
        const messageId = await sendMessageWithRetry(bot,message,channelId,TookKeyboard());
        if (messageId !== null) {
            const res = await updateActiveSurvey( survey_active_id, {messageId:messageId});
            if(!res){
                logger.error(`Не удалось обновить messageId для записи survey_active_id:${survey_active_id}`);

            }
        } else {
            logger.error(`Не удалось отправить сообщение для записи  survey_active_id:${survey_active_id}`);
        }
    } catch (error) {
        logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
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
