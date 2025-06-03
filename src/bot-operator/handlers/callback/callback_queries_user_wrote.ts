import { MyContext } from "../../../bot-common/types/type";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import logger from "../../../lib/logger";
import { HANDLER_USER_WROTE } from "../../../bot-common/constants/handler_callback_queries";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";
import {
  getActiveSurvey,
  updateActiveSurvey,
} from "../../../database/queries_kysely/survey_active";
import { getUser } from "../../../database/queries_kysely/users";

export async function handleUserWrote(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_USER_WROTE.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      new RegExp(`^${BUTTONS_CALLBACK_QUERIES.ThisUserWrote}_(\\d+)$`),
    );

    if (!match) {
      await ctx.reply(HANDLER_USER_WROTE.ERROR_DATA_INVALID);
      return;
    }
    const surveyActiveId = parseInt(match[1], 10);

    const resultUpdate = await updateActiveSurvey(surveyActiveId, {
      reservationMinutes: null,
    });
    if (resultUpdate) {
      const newSurveyActive = await getActiveSurvey({
        surveyActiveId: surveyActiveId,
      });
      if (!newSurveyActive) return;

      const user = await getUser({ user_id: newSurveyActive.user_id });
      if (!user) return;

      let message = `Вы отметили, что пользователь `;
      const username = user.last_tg_account;
      if (username) {
        message += "@" + username + " написал.";
      }
      const codeword = newSurveyActive.code_word;
      if (codeword) {
        message += "с кодовым словом " + codeword + " написал.";
      }

      await ctx.reply(message);
    }
  } catch (error) {
    logger.error("Error in handleCancelSurvey: " + error);
    await ctx.reply(HANDLER_USER_WROTE.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
