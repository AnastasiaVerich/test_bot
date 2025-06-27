import { Bot } from "grammy";
import { channelIdOperator } from "../../../config/env";
import { MyContext } from "../../../bot-common/types/type";
import { HANDLER_TOOK_SURVEY } from "../../../bot-common/constants/handler_callback_queries";
import logger from "../../../lib/logger";
import { getOperatorByIdPhoneOrTg } from "../../../database/queries_kysely/operators";
import {
  getActiveSurvey,
  getAllActiveSurveysByOperator,
} from "../../../database/queries_kysely/survey_active";
import {
  getInfoAboutSurvey,
  reservationSurveyActiveByOperator,
} from "../../../database/services/surveyService";

export const handleCQTookSurvey = async (
  ctx: MyContext,
  bot: Bot<MyContext>,
) => {
  try {
    const message_id = ctx.update.callback_query?.message?.message_id;
    const chat_id = ctx.update.callback_query?.message?.chat.id;
    const operator_id = ctx.update.callback_query?.from?.id;
    if (!message_id || !chat_id || !operator_id) return;
    if (chat_id.toString() === channelIdOperator) {
      const operator = await getOperatorByIdPhoneOrTg({
        operator_id: operator_id,
      });
      if (!operator) return;

      if (!operator.can_take_multiple_surveys) {
        const hasActiveSurvey = await getActiveSurvey({
          operatorId: operator_id,
        });
        if (hasActiveSurvey) return;
      } else {
        const allActiveSurvey =
          await getAllActiveSurveysByOperator(operator_id);
        if (allActiveSurvey.length >= 10) return;
      }
      const active_survey = await getActiveSurvey({ messageId: message_id });
      if (!active_survey) return;

      const surveyInfo = await getInfoAboutSurvey(active_survey.survey_id);
      if (!surveyInfo) return;

      if (active_survey.operator_id) return;

      const isReservation = await reservationSurveyActiveByOperator({
        operatorId: operator_id,
        surveyActiveId: active_survey.survey_active_id,
        reservationMinutes: surveyInfo.reservation_time_min,
      });
      if (!isReservation) return;

      await ctx.api.deleteMessage(channelIdOperator, message_id);
      let messages = HANDLER_TOOK_SURVEY.TOOK_IT;

      await bot.api.sendMessage(operator_id, messages, {
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    logger.error("Error in handleTookSurvey: " + error);
    await ctx.reply(HANDLER_TOOK_SURVEY.SOME_ERROR);
  }
};
