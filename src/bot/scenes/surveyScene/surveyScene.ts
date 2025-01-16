import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { Message } from "grammy/types";
import { LocationType, MyContext } from "../../types/type";

import { RegionSettings } from "../../../database/queries/regionQueries";
import {
  checkAndUpdateSurveyStatus,
  findAvailableSurvey,
  getRecentSurveyTypesForUser,
  reserveSurvey,
  Survey,
} from "../../../database/queries/surveyQueries";
import { updateUserStatus, User } from "../../../database/queries/userQueries";
import {
  getOperatorsByRegionAndStatus,
  Operator,
  updateOperatorStatus,
} from "../../../database/queries/operatorQueries";
import { AuthUserKeyboard } from "../../keyboards/AuthUserKeyboard";
import { SURVEY_SCENE } from "../../constants/scenes";
import { BUTTONS_KEYBOARD } from "../../constants/button";
import { formatTimestamp, isDateDifferenceAtLeast } from "../../../lib/date";
import { Scenes } from "../index";
import { MESSAGES } from "../../constants/messages";
import { db } from "../../../database/dbClient";
import logger from "../../../lib/logger";
import { getUserId } from "../../utils/getUserId";
import { findRegionByLocation } from "../../../utils/regionUtils";
import { findUser } from "../../utils/findUser";

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

    // Шаг 0: Проверяем, нужно ли пользователя перебросить на инициализацию
    const isInit = await stepCheckLastInit(ctx, user);
    if (!isInit) return;

    // Шаг 1: Проверка, может ли пользователь проходит опрос
    const isAllowed = await canTakeSurvey(ctx, nowDateTime, user);
    if (!isAllowed) return;

    // Шаг 2: Ожидаем локацию
    const region = await stepRegionLocation(conversation, ctx);
    if (!region) return;

    // Шаг 3:  Ищем опрос
    const survey = await stepSearchAvailableSurvey(ctx, userId, region);
    if (!survey) return;

    // Шаг 4:  Ищем свободного оператора
    const operator = await stepSearchFreeOperator(ctx, region);
    if (!operator) return;

    //Шаг 5: меняем статус пользователю, оператору и запросу.
    const isSuccess = await stepReservation(userId, operator, survey, region);
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

async function canTakeSurvey(
  ctx: MyContext,
  nowDateTime: Date,
  user: User,
): Promise<boolean> {
  let isAllowed = true;
  if (user.status === "busy") {
    await ctx.reply(SURVEY_SCENE.USER_BUSY, {
      reply_markup: AuthUserKeyboard(),
    });
    isAllowed = false;
  }

  if (
    user.survey_lock_until &&
    Number(new Date(user.survey_lock_until)) > Number(nowDateTime)
  ) {
    await ctx.reply(
      `${SURVEY_SCENE.USER_CANT_SURVEY} ${formatTimestamp(Number(user.survey_lock_until))}`,
      {
        reply_markup: AuthUserKeyboard(),
      },
    );

    isAllowed = false;
  }
  return isAllowed;
}

async function stepCheckLastInit(ctx: MyContext, user: User): Promise<boolean> {
  let isInit = true;
  const nowDateTime = new Date();

  if (isDateDifferenceAtLeast(nowDateTime.toString(), user.last_init, 7)) {
    await ctx.conversation.enter(Scenes.IdentificationScene);
    isInit = false;
  }
  return isInit;
}

async function stepRegionLocation(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<RegionSettings | null> {
  await ctx.reply(SURVEY_SCENE.INPUT_LOCATION, {
    reply_markup: new Keyboard()
      .requestLocation(BUTTONS_KEYBOARD.GeolocationButton)
      .resized()
      .oneTime(),
  });

  const message = await conversation.waitFor("message:location");

  const location: LocationType = message.message?.location;

  if (!location.latitude || !location.longitude) {
    await ctx.reply(SURVEY_SCENE.LOCATION_FAILED, {
      reply_markup: AuthUserKeyboard(),
    });
    return null;
  }
  const region = await findRegionByLocation(location);

  if (!region) {
    await ctx.reply(SURVEY_SCENE.REGION_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }
  return region;
}

async function stepSearchAvailableSurvey(
  ctx: MyContext,
  userId: number,
  region: RegionSettings,
): Promise<Survey | null> {
  // Достать темы, которые оператор проходил последние XX дней
  const recentSurveyTypes = await getRecentSurveyTypesForUser(
    userId,
    region.query_similar_topic_days,
  );

  // Освобождаем опросы, которые возможно зря забронированы
  await checkAndUpdateSurveyStatus();

  //Найти опрос, который не соотвествует темам, которые пользователь уже проходил, который находится в этом регионе
  const survey = await findAvailableSurvey(
    userId,
    region.region_id,
    recentSurveyTypes,
  );

  if (!survey) {
    await ctx.reply(SURVEY_SCENE.SURVEY_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }
  return survey;
}

async function stepSearchFreeOperator(
  ctx: MyContext,
  region: RegionSettings,
): Promise<Operator | undefined> {
  const freeOperator = await getOperatorsByRegionAndStatus(
    region.region_id,
    "free",
  );
  if (freeOperator.length === 0) {
    await ctx.reply(SURVEY_SCENE.OPERATOR_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  }
  return freeOperator[0];
}

async function stepReservation(
  userId: number,
  operator: Operator,
  survey: Survey,
  region: RegionSettings,
): Promise<boolean> {
  // Обновляем статус пользователя
  const client = await db.connect(); // Получение соединения с базой данных
  try {
    await client.query("BEGIN"); // Начинаем транзакцию

    await updateUserStatus(userId, "busy");

    // Обновляем статус оператора
    await updateOperatorStatus(operator.operator_id, "busy");

    // Обновляем опрос
    await reserveSurvey(
      survey.survey_id,
      userId,
      operator.operator_id,
      region.reservation_time_min,
    );
    await client.query("COMMIT"); // Фиксируем транзакцию
    return true;
  } catch (error) {
    logger.error(error);

    await client.query("ROLLBACK"); // Откатываем транзакцию в случае ошибки
    return false;
  } finally {
    client.release(); // Освобождаем клиента
  }
}
