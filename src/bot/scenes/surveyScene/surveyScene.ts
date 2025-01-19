import { Conversation } from "@grammyjs/conversations";
import { Message } from "grammy/types";
import { MyContext } from "../../types/type";

import { AuthUserKeyboard } from "../../keyboards/AuthUserKeyboard";
import { SURVEY_SCENE } from "../../constants/scenes";
import { MESSAGES } from "../../constants/messages";
import logger from "../../../lib/logger";
import { getUserId } from "../../utils/getUserId";
import { findUser } from "../../utils/findUser";
import { isUserMustInit } from "../../utils/isUserMustInit";
import { canTakeSurvey } from "./steps/canUserTakeSurvey";
import { regionState } from "./steps/regionState";
import { searchSurveyStep } from "./steps/searchSurveyStep";
import { searchOperatorStep } from "./steps/searchOperatorStep";
import { reservationStep } from "./steps/reservationStep";

export async function surveyScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<Message.TextMessage | void> {
  try {
    const userId = await getUserId(ctx);
    if (!userId) return;

    const user = await findUser(userId, ctx);
    if (!user) return;

    const nowDateTime = new Date();

    // Проверяем, нужно ли пользователя перебросить на инициализацию
    const isInitLongTimeAgo = await isUserMustInit(ctx, user);
    if (isInitLongTimeAgo) return;

    // Шаг 1: Проверка, может ли пользователь проходить опрос
    const isUserAllowed = await canTakeSurvey(ctx, nowDateTime, user);
    if (!isUserAllowed) return;

    // Шаг 2: Ожидаем локацию
    const region = await regionState(conversation, ctx);
    if (!region) return;

    // Шаг 3:  Ищем опрос
    const survey = await searchSurveyStep(ctx, userId, region);
    if (!survey) return;

    // Шаг 4:  Ищем свободного оператора
    const operator = await searchOperatorStep(ctx, region);
    if (!operator) return;

    //Шаг 5: меняем статус пользователю, оператору и запросу.
    const isSuccess = await reservationStep(userId, operator, survey, region);

    if (isSuccess) {
      return ctx.reply(
        `Оператор @${operator.tg_account} ${SURVEY_SCENE.SUCCESS}`,
        { reply_markup: AuthUserKeyboard() },
      );
    } else {
      return ctx.reply(SURVEY_SCENE.FAILED, {
        reply_markup: AuthUserKeyboard(),
      });
    }
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error in surveyScene: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR);
  }
}
