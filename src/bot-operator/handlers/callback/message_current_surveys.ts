import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { HANDLER_CURRENT_SURVEYS } from "../../../bot-common/constants/handler_messages";
import { CreateInlineKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { getAllActiveSurveysUnreservedByOperatorId } from "../../../database/queries_kysely/survey_active";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { getUsersByIds } from "../../../database/queries_kysely/users";

export const handleMessageCurrentSurveys = async (ctx: MyContext) => {
  try {
    const operator_id = await getUserId(ctx);
    if (!operator_id) return;

    const currentActiveSurveys =
      await getAllActiveSurveysUnreservedByOperatorId(operator_id);

    if (currentActiveSurveys.length === 0) {
      await ctx.reply(HANDLER_CURRENT_SURVEYS.NO_CURRENT_SURVEYS);
      return;
    }
    const users = await getUsersByIds(
      currentActiveSurveys.map((e) => e.user_id),
    );

    const wordStr = currentActiveSurveys.map((e) => {
      const tg_acc = users.find(
        (el) => el.user_id === e.user_id,
      )?.last_tg_account;
      return {
        label: tg_acc
          ? `${HANDLER_CURRENT_SURVEYS.TG_ACC} ${tg_acc}`
          : `${HANDLER_CURRENT_SURVEYS.CODE_WORD} ${e.code_word}`,
        value:
          BUTTONS_CALLBACK_QUERIES.ThisUserGetSurveyInfo +
          "_" +
          e.survey_active_id,
      };
    });

    await ctx.reply(HANDLER_CURRENT_SURVEYS.HEADER, {
      parse_mode: "HTML",
      reply_markup: CreateInlineKeyboard(wordStr),
    });
  } catch (error) {
    logger.error("Error in currentSurveysHandler: " + error);
    await ctx.reply(HANDLER_CURRENT_SURVEYS.SOME_ERROR);
  }
};
