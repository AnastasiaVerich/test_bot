import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import { getOperatorByIdPhoneOrTg } from "../../database/queries_kysely/operators";
import { SurveyActiveType } from "../../database/db-types";
import { getAllActiveSurveysWhereReservationEnd } from "../../database/queries_kysely/survey_active";

async function processRecord(
  bot: Bot<MyContext>,
  record: SurveyActiveType,
): Promise<void> {
  const { survey_active_id, user_id, operator_id, created_at } = record;
  if (!operator_id) return;
  const operator = await getOperatorByIdPhoneOrTg({ operator_id: operator_id });
  const message = `Время резервации вышло`;
  try {
    const messageId = await sendMessageWithRetry(bot, message, user_id);

    if (messageId == null) {
      logger.error(
        `Не удалось отправить сообщение для записи ${survey_active_id}`,
      );
    }
  } catch (error) {
    logger.error(`Ошибка при обработке записи ${survey_active_id}:`, error);
  }
}

export async function subscribeUser_notifyReservationEnd(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "reservation_ended",
    getAllActiveSurveysWhereReservationEnd,
    processRecord,
  );
}
