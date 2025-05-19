import { Message } from "grammy/types";

import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { findUser } from "../utils/findUser";
import { formatTimestamp } from "../../lib/date";
import {
  AuthUserKeyboard,
  sendLocation,
} from "../../bot-common/keyboards/keyboard";
import { SURVEY_USER_SCENE } from "../../bot-common/constants/scenes";
import {
  LocationType,
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getUserAccount } from "../../bot-common/utils/getUserTgAccount";
import {
  formatLocation,
  GeocodeResponse,
  reverseGeocode,
} from "../../services/getDataLocation";
import { RegionSettingsType, SurveysType } from "../../database/db-types";
import {
  getLeastCompletedSurvey,
  getLeastCompletedSurveyForRegion,
} from "../../database/queries_kysely/surveys";
import {
  checkCanUserTakeSurvey,
  takeSurveyByUser,
} from "../../database/services/surveyService";
import { addUserLogs } from "../../database/queries_kysely/bot_user_logs";

export async function surveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    const user = await conversation.external(() => findUser(userId, ctx));
    if (!user) return;

    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "survey_start",
        event_data: `{}`,
      }),
    );

    let codeWord: string | null = null;
    const userAccount = await conversation.external(() =>
      getUserAccount(ctx, true),
    );
    if (!userAccount) {
      const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;
      codeWord = randomNumber.toString();
    }

    const resultCheck = await conversation.external(() =>
      checkCanUserTakeSurvey(user),
    );

    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "survey_can_take",
        event_data: `${JSON.stringify(resultCheck)}`,
      }),
    );

    if (!resultCheck.result) {
      switch (resultCheck.reason) {
        case "userInSurveyActive":
          {
            await ctx.reply(SURVEY_USER_SCENE.USER_BUSY, {
              reply_markup: AuthUserKeyboard(),
            });
          }
          break;
        case "is_survey_lock":
          {
            await ctx.reply(
              `${SURVEY_USER_SCENE.USER_LOCK_UNTIL} ${formatTimestamp(resultCheck.surveyUntil ?? 0)}.`,
              {
                reply_markup: AuthUserKeyboard(),
              },
            );
          }
          break;
      }

      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "survey_failed",
          event_data: `{}`,
        }),
      );
      return;
    }

    // Шаг 2: Ожидаем локацию
    const location = await stepLocation(conversation, ctx);
    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "survey_location",
        event_data: `{"result":"${location}"}`,
      }),
    );
    if (!location) {
      await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
        reply_markup: AuthUserKeyboard(),
      });
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "survey_failed",
          event_data: `{}`,
        }),
      );
      return;
    }

    const location_string = formatLocation(location);

    // const region = await findRegionByLocation(location);
    // if (!region) {
    //     await ctx.reply(SURVEY_USER_SCENE.REGION_NOT_FOUND, {
    //         reply_markup: AuthUserKeyboard(),
    //     });
    //     return
    // }

    // Шаг 3:  Ищем опрос
    const survey_id = await stepSearchSurvey(ctx);
    await conversation.external(() =>
      addUserLogs({
        user_id: userId,
        event_type: "survey_search",
        event_data: `{"result":"${survey_id}"}`,
      }),
    );
    if (!survey_id) {
      await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
        reply_markup: AuthUserKeyboard(),
      });
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "survey_failed",
          event_data: `{}`,
        }),
      );
      return;
    }

    //Шаг 5: меняем статус пользователю, оператору и запросу.
    const isSuccess = await reservationStep(
      userId,
      survey_id,
      userAccount,
      codeWord,
      location_string,
    );

    if (isSuccess) {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "survey_success",
          event_data: `{}`,
        }),
      );
      return ctx.reply(
        //`Оператор @${'andrei_s086'} ${SURVEY_USER_SCENE.SUCCESS}`,
        `${SURVEY_USER_SCENE.SUCCESS}`,
        { reply_markup: AuthUserKeyboard() },
      );
    } else {
      await conversation.external(() =>
        addUserLogs({
          user_id: userId,
          event_type: "survey_failed",
          event_data: `{}`,
        }),
      );
      return ctx.reply(SURVEY_USER_SCENE.FAILED, {
        reply_markup: AuthUserKeyboard(),
      });
    }
  } catch (error) {
    const userId = await conversation.external(() => getUserId(ctx));

    await conversation.external(() =>
      addUserLogs({
        user_id: userId ?? 0,
        event_type: "survey_failed",
        event_data: `{}`,
      }),
    );
    logger.error("Error in survey: " + error);
    await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
      reply_markup: AuthUserKeyboard(),
    });
  }
}

async function stepLocation(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
): Promise<null | GeocodeResponse> {
  try {
    await ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION, {
      parse_mode: "HTML",
      reply_markup: sendLocation(),
    });

    let location: LocationType | null = null;
    let response: GeocodeResponse | null = null;
    //Два выхода из цикла — локация юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:location", {
        otherwise: (ctx) =>
          ctx.reply(SURVEY_USER_SCENE.ENTER_LOCATION_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: sendLocation(),
          }),
      });

      if (!response.message?.location) break;

      if ("forward_date" in response.message) {
        await ctx.reply(SURVEY_USER_SCENE.ENTERED_NOT_USER_LOCATION, {
          parse_mode: "HTML",
          reply_markup: sendLocation(),
        });
        continue;
      }

      location = response.message.location;
      break;
    }
    if (location) {
      response = await reverseGeocode(location?.latitude, location?.longitude);
    }

    return response;
  } catch (error) {
    logger.error("Error in surveyScene stepLocation: ", error);
    return null;
  }
}

async function stepSearchSurvey(
  ctx: MyConversationContext,
  region?: RegionSettingsType,
): Promise<number | undefined | null> {
  try {
    let survey: SurveysType | null;
    if (region) {
      survey = await getLeastCompletedSurveyForRegion(region.region_id);
    } else {
      survey = await getLeastCompletedSurvey();
    }

    if (!survey) {
      await ctx.reply(SURVEY_USER_SCENE.SURVEY_NOT_FOUND, {
        reply_markup: AuthUserKeyboard(),
      });
      return;
    }

    return survey.survey_id;
  } catch (error) {
    logger.error("Error in surveyScene stepSearchSurvey: ", error);

    return null;
  }
}

async function reservationStep(
  userId: number,
  survey_id: number,
  tg_account: string | null,
  code_word: string | null,
  location_string: string,
): Promise<boolean> {
  try {
    await takeSurveyByUser({
      surveyId: survey_id,
      userId: userId,
      tg_account: tg_account,
      code_word: code_word,
      location_string: location_string,
    });
    return true;
  } catch (error) {
    logger.error("Error in surveyScene reservationStep: ", error);

    return false;
  }
}
