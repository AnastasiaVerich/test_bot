import { MyContext } from "../../../bot-common/types/type";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import logger from "../../../lib/logger";
import { HANDLER_RECHECK_THIS_SURVEY } from "../../../bot-common/constants/handler_callback_queries";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";
import { ScenesOperator } from "../../scenes";

export async function handleCQRecheckThisSurvey(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_RECHECK_THIS_SURVEY.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      new RegExp(`^${BUTTONS_CALLBACK_QUERIES.ThisSurveyNeedRecheck}_(\\d+)$`),
    );

    if (!match) {
      await ctx.reply(HANDLER_RECHECK_THIS_SURVEY.ERROR_DATA_INVALID);
      return;
    }
    const recheckSurveyId = parseInt(match[1], 10);

    await ctx.conversation.enter(ScenesOperator.RecheckSurvey, {
      state: { recheckSurveyId: recheckSurveyId },
    });
  } catch (error) {
    logger.error("Error in handleCancelSurvey: " + error);
    await ctx.reply(HANDLER_RECHECK_THIS_SURVEY.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
