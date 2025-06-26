import { Bot } from "grammy";
import { channelIdOperator } from "../../config/env";
import { MyContext } from "../../bot-common/types/type";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import { TookSurveyInlineKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import {
  getAllNewActiveSurveysWithoutOperator,
  updateActiveSurvey,
} from "../../database/queries_kysely/survey_active";
import { SurveyActiveType } from "../../database/db-types";

async function processRecord(
  bot: Bot<MyContext>,
  record: SurveyActiveType,
): Promise<void> {
  const { survey_active_id, created_at } = record;
  const message = `Новый активный опрос!\nСоздан: ${created_at}`;

  try {
    const messageId = await sendMessageWithRetry(
      bot,
      message,
      channelIdOperator,
      TookSurveyInlineKeyboard(),
    );
    if (messageId !== null) {
      const res = await updateActiveSurvey(survey_active_id, {
        messageId: messageId,
      });
      if (!res) {
        logger.error(
          `Не удалось обновить messageId для записи survey_active_id:${survey_active_id}`,
        );
      }
    } else {
      logger.error(
        `Не удалось отправить сообщение для записи  survey_active_id:${survey_active_id}`,
      );
    }
  } catch (error) {
    logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
  }
}

export async function subscribeOperator_newFreeSurvey(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "survey_active_insert",
    getAllNewActiveSurveysWithoutOperator,
    processRecord,
  );
}
