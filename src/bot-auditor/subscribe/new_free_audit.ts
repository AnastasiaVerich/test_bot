import { Bot } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import { AuditorSurveyActiveType } from "../../database/db-types";
import {
  sendMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import { channelIdAuditor } from "../../config/env";
import { TookAuditSurveyInlineKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import logger from "../../lib/logger";
import {
  getAllAuditNewSurveyActive,
  updateAuditActiveSurvey,
} from "../../database/queries_kysely/audit_survey_active";

async function processRecord(
  bot: Bot<MyContext>,
  record: AuditorSurveyActiveType,
): Promise<void> {
  const { audit_survey_active_id, created_at } = record;
  const message = `Новый активный аудит!\nСоздан: ${created_at}`;

  try {
    const messageId = await sendMessageWithRetry(
      bot,
      message,
      channelIdAuditor,
      TookAuditSurveyInlineKeyboard(),
    );
    if (messageId !== null) {
      const res = await updateAuditActiveSurvey(audit_survey_active_id, {
        messageId: messageId,
      });
      if (!res) {
        logger.error(
          `Не удалось обновить messageId для записи audit_survey_active_id:${audit_survey_active_id}`,
        );
      }
    } else {
      logger.error(
        `Не удалось отправить сообщение для записи  audit_survey_active_id:${audit_survey_active_id}`,
      );
    }
  } catch (error) {
    logger.error(
      `Ошибка при обработке записи ${audit_survey_active_id}:`,
      error,
    );
  }
}

export async function subscribeAuditor_newFreeAudit(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "audit_survey_active_insert",
    getAllAuditNewSurveyActive,
    processRecord,
  );
}
