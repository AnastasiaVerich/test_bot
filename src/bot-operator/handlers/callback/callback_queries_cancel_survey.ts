import { MyContext } from "../../../bot-common/types/type";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { getActiveSurvey } from "../../../database/queries_kysely/survey_active";
import { cancelTakeSurveyByUser } from "../../../database/services/surveyService";
import logger from "../../../lib/logger";
import { HANDLER_CANCEL_SURVEY } from "../../../bot-common/constants/handler_callback_queries";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";

export async function handleCancelSurvey(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_CANCEL_SURVEY.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      new RegExp(`^${BUTTONS_CALLBACK_QUERIES.CancelSurveyButton}_(\\d+)$`),
    );

    if (!match) {
      await ctx.reply(HANDLER_CANCEL_SURVEY.ERROR_DATA_INVALID);
      return;
    }
    const surveyActiveId = parseInt(match[1], 10);
    const activeSurvey = await getActiveSurvey({
      surveyActiveId: surveyActiveId,
    });
    if (!activeSurvey) return;
    await cancelTakeSurveyByUser(
      activeSurvey.survey_active_id,
      activeSurvey.survey_id,
    );
    await ctx.reply(HANDLER_CANCEL_SURVEY.SUCCESS);
  } catch (error) {
    logger.error("Error in handleCancelSurvey: " + error);
    await ctx.reply(HANDLER_CANCEL_SURVEY.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
