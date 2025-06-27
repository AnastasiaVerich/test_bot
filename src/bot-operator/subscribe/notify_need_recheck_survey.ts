import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import { RecheckSurveyType } from "../../database/db-types";
import {
  getAllRecheckWhereOperatorNotNotify,
  updateRecheckSurvey,
} from "../../database/queries_kysely/recheck_survey";
import { RESPONSES } from "../../bot-common/constants/responses";

async function processRecord(
  bot: Bot<MyContext>,
  record: RecheckSurveyType,
): Promise<void> {
  const { operator_id, recheck_survey_id } = record;
  if (!operator_id) return;

  try {
    const messageId = await sendMessageWithRetry(
      bot,
      RESPONSES.NOT_SAME_WITH_AUDITOR,
      operator_id,
    );

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

export async function subscribeOperator_notifyRecheckSurvey(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "recheck_operator_assigned",
    getAllRecheckWhereOperatorNotNotify,
    processRecord,
  );
}
