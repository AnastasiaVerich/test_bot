import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { HANDLER_NEW_SURVEYS } from "../../../bot-common/constants/handler_messages";
import { NewSurveysKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { getAllActiveSurveysReservationByOperator } from "../../../database/queries_kysely/survey_active";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";

export const newSurveysHandler = async (ctx: MyContext) => {
  try {
    const operator_id = await getUserId(ctx);
    if (!operator_id) return;

    const newActiveSurveys =
      await getAllActiveSurveysReservationByOperator(operator_id);

    if (newActiveSurveys.length === 0) {
      await ctx.reply(HANDLER_NEW_SURVEYS.NO_NEW_SURVEYS);
      return;
    }
    const wordStr = newActiveSurveys.map((e) => ({
      label: e.tg_account
        ? `${HANDLER_NEW_SURVEYS.TG_ACC} ${e.tg_account}`
        : `${HANDLER_NEW_SURVEYS.CODE_WORD} ${e.code_word}`,
      value: BUTTONS_CALLBACK_QUERIES.ThisUserWrote + "_" + e.survey_active_id,
    }));

    await ctx.reply(HANDLER_NEW_SURVEYS.HEADER, {
      parse_mode: "HTML",
      reply_markup: NewSurveysKeyboard(wordStr),
    });
  } catch (error) {
    logger.error("Error in newSurveysHandler: " + error);
    await ctx.reply(HANDLER_NEW_SURVEYS.SOME_ERROR);
  }
};
