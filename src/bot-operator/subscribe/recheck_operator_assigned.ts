import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import { RecheckSurveyType } from "../../database/db-types";
import { updateRecheckSurvey } from "../../database/queries_kysely/recheck_survey";

async function processRecord(
  bot: Bot<MyContext>,
  record: RecheckSurveyType,
): Promise<void> {
  const { operator_id, recheck_survey_id } = record;
  if (!operator_id) return;

  let message = `Вам необходимо перезаполнить ответы на опрос, так как ваши ответы разняться с ответами аудитора.`;

  try {
    const messageId = await sendMessageWithRetry(bot, message, operator_id);

    if (messageId !== null) {
      const resUpdate = await updateRecheckSurvey(recheck_survey_id, {
        is_operator_notified: true,
      });
      if (!resUpdate) {
        logger.info(
          `Не удалось обновить  is_operator_notified для записи ${recheck_survey_id}`,
        );
      }
    } else {
      logger.info(
        `Не удалось отправить сообщение для записи ${recheck_survey_id}`,
      );
    }
  } catch (error) {
    logger.error(`Ошибка при обработке записи ${recheck_survey_id}:`, error);
  }
}

export async function subscribeRecheckOperatorAssigned(
  bot: Bot<MyContext>,
): Promise<void> {
  const query = `
        SELECT *
        FROM recheck_survey
        WHERE operator_id IS NOT NULL
        AND is_operator_notified IS FALSE
        ORDER BY created_at ASC
    `;
  await subscribeToChannel(
    bot,
    "recheck_operator_assigned",
    query,
    processRecord,
  );
}
