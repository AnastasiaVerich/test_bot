import logger from "../../../lib/logger";
import { HANDLER_FINISH_SURVEY } from "../../../bot-common/constants/handler_callback_queries";
import { MyContext } from "../../../bot-common/types/type";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { ScenesOperator } from "../../scenes";
import { createCallbackRegex } from "../../../utils/callBackRegex";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";

export async function handleCQFinishSurvey(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_FINISH_SURVEY.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.FinishSurveyButton),
    );

    if (!match) {
      await ctx.reply(HANDLER_FINISH_SURVEY.ERROR_DATA_INVALID);
      return;
    }
    const surveyActiveId = parseInt(match[1], 10);
    await ctx.conversation.enter(ScenesOperator.FinishSurveyScene, {
      state: { surveyActiveId: surveyActiveId },
    });
  } catch (error) {
    logger.error("Error in handleFinishSurvey: " + error);
    await ctx.reply(HANDLER_FINISH_SURVEY.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
