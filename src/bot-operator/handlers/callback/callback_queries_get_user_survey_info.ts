import { MyContext } from "../../../bot-common/types/type";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import logger from "../../../lib/logger";
import { HANDLER_GET_USER_SURVEY_INFO } from "../../../bot-common/constants/handler_callback_queries";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";
import { getActiveSurvey } from "../../../database/queries_kysely/survey_active";
import { getInfoAboutSurvey } from "../../../database/services/surveyService";
import { getAllSurveyTasks } from "../../../database/queries_kysely/survey_tasks";
import { FinishSurveyKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";

export async function handleGetUserSurveyInfo(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_GET_USER_SURVEY_INFO.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      new RegExp(`^${BUTTONS_CALLBACK_QUERIES.ThisUserGetSurveyInfo}_(\\d+)$`),
    );

    if (!match) {
      await ctx.reply(HANDLER_GET_USER_SURVEY_INFO.ERROR_DATA_INVALID);
      return;
    }
    const surveyActiveId = parseInt(match[1], 10);

    const active_survey = await getActiveSurvey({
      surveyActiveId: surveyActiveId,
    });
    if (!active_survey) return;

    const surveyInfo = await getInfoAboutSurvey(active_survey.survey_id);
    if (!surveyInfo) return;

    const surveyActiveTasks = await getAllSurveyTasks(active_survey.survey_id);

    let message = [
      `<b>📋 Опрос</b>`,
      //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
      //`<b>Тип:</b> ${surveyActive.survey_type}`,
      //`<b>Описание:</b> ${surveyActive.description}`,
      `<b>Геолокация опроса:</b> ${surveyInfo.region_name}`,
      `<b>Геолокация пользователя:</b> ${active_survey.user_location}`,
      ``, // Empty line for spacing
    ].join("\n");

    message += "\n\n<b>📝 Задания:</b>\n";
    surveyActiveTasks.forEach((task, index) => {
      message += `<b>${index + 1}:</b> ${task.description.replaceAll("/n", "\n")}\n`;
    });
    await ctx.reply(`${message}`, { parse_mode: "HTML" });

    await ctx.reply(HANDLER_GET_USER_SURVEY_INFO.IF_NEED_FINISH_SURVEY, {
      reply_markup: FinishSurveyKeyboard(surveyActiveId),
    });
  } catch (error) {
    logger.error("Error in handleCancelSurvey: " + error);
    await ctx.reply(HANDLER_GET_USER_SURVEY_INFO.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
