import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import { formatTimestamp } from "../../lib/date";
import {
  getAllUsersWhereNotifyFinishSurvey,
  updateUserByUserId,
} from "../../database/queries_kysely/users";
import { UsersType } from "../../database/db-types";
import logger from "../../lib/logger";

async function processRecord(
  bot: Bot<MyContext>,
  record: UsersType,
): Promise<void> {
  const { user_id, survey_lock_until } = record;
  const lockUntilTimespan = survey_lock_until
    ? Number(new Date(survey_lock_until))
    : null;

  let message = `Опрос пройден.`;
  if (survey_lock_until) {
    message += ` Следующий опрос будет доступен не раньше, чем ${formatTimestamp(lockUntilTimespan ?? 0)}.`;
  }
  try {
    const messageId = await sendMessageWithRetry(bot, message, user_id);
    if (messageId !== null) {
      await updateUserByUserId(user_id, { notifyReason: null });
    }
  } catch (error) {
    logger.error(`Ошибка при обработке записи ${user_id}:`, error);
  }
}

export async function subscribeUser_notifySurveyFinish(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "finish_survey_notification",
    getAllUsersWhereNotifyFinishSurvey,
    processRecord,
  );
}
