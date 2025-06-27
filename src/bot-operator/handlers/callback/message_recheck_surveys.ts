import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { HANDLER_RECHECK_SURVEYS } from "../../../bot-common/constants/handler_messages";
import { CreateInlineKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { getAllRecheckSurveyByOperatorId } from "../../../database/queries_kysely/recheck_survey";

export const handleRecheckSurveys = async (ctx: MyContext) => {
  try {
    const operator_id = await getUserId(ctx);
    if (!operator_id) return;

    const newRecheckSurveys =
      await getAllRecheckSurveyByOperatorId(operator_id);

    if (newRecheckSurveys.length === 0) {
      await ctx.reply(HANDLER_RECHECK_SURVEYS.NO_RECHECK_SURVEYS);
      return;
    }
    const wordStr = newRecheckSurveys.map((e) => {
      const recheck_survey_id = e.recheck_survey_id;
      return {
        label: `${HANDLER_RECHECK_SURVEYS.RECHECK_NUMBER_ID} ${recheck_survey_id}`,
        value:
          BUTTONS_CALLBACK_QUERIES.ThisSurveyNeedRecheck +
          "_" +
          recheck_survey_id,
      };
    });

    await ctx.reply(HANDLER_RECHECK_SURVEYS.HEADER, {
      parse_mode: "HTML",
      reply_markup: CreateInlineKeyboard(wordStr),
    });
  } catch (error) {
    logger.error("Error in recheckSurveysHandler: " + error);
    await ctx.reply(HANDLER_RECHECK_SURVEYS.SOME_ERROR);
  }
};
