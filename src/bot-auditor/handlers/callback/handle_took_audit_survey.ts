import { Bot } from "grammy";
import { channelIdAuditor } from "../../../config/env";
import { MyContext } from "../../../bot-common/types/type";
import { HANDLER_TOOK_AUDIT_SURVEY } from "../../../bot-common/constants/handler_callback_queries";
import logger from "../../../lib/logger";
import { getAuditorByIdPhoneOrTg } from "../../../database/queries_kysely/auditors";
import {
  getAuditSurveyActiveByAuditorId,
  getAuditSurveyActiveByMessageId,
} from "../../../database/queries_kysely/audit_survey_active";
import { reservationAuditSurveyActiveByAuditor } from "../../../database/services/auditService";

export const handleTookAuditSurvey = async (
  ctx: MyContext,
  bot: Bot<MyContext>,
) => {
  try {
    const message_id = ctx.update.callback_query?.message?.message_id;
    const chat_id = ctx.update.callback_query?.message?.chat.id;
    const auditor_id = ctx.update.callback_query?.from?.id;
    if (!message_id || !chat_id || !auditor_id) return;
    if (chat_id.toString() === channelIdAuditor) {
      const auditor = await getAuditorByIdPhoneOrTg({
        auditor_id: auditor_id,
      });
      if (!auditor) return;

      const hasAuditActiveSurvey =
        await getAuditSurveyActiveByAuditorId(auditor_id);
      if (hasAuditActiveSurvey) return;

      const active_audit_survey =
        await getAuditSurveyActiveByMessageId(message_id);
      if (!active_audit_survey) return;

      if (active_audit_survey.auditor_id) return;

      const isReservation = await reservationAuditSurveyActiveByAuditor({
        auditor_id: auditor_id,
        audit_survey_active_id: active_audit_survey.audit_survey_active_id,
      });
      if (!isReservation) return;

      await ctx.api.deleteMessage(channelIdAuditor, message_id);
      let messages = HANDLER_TOOK_AUDIT_SURVEY.TOOK_IT;

      await bot.api.sendMessage(auditor_id, messages, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    logger.error("Error in handleTookAuditSurvey: " + error);
    await ctx.reply(HANDLER_TOOK_AUDIT_SURVEY.SOME_ERROR);
  }
};
