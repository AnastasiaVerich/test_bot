import { Message } from "grammy/types";

import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { findUser } from "../utils/findUser";
import { formatTimestamp } from "../../lib/date";
import { RESPONSES } from "../../bot-common/constants/responses";
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

export async function surveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    let codeWord = null;
    const userAccount = await conversation.external(() =>
      getUserAccount(ctx, true),
    );
    if (!userAccount) {
      const randomNumber = Math.floor(Math.random() * (99 - 10 + 1)) + 10;

      codeWord = randomNumber.toString();
    }

    const user = await conversation.external(() => findUser(userId, ctx));
    if (!user) return;
    const resultCheck = await conversation.external(() =>
      checkCanUserTakeSurvey(user),
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
      return;
    }

    // Шаг 2: Ожидаем локацию
    const location = await stepLocation(conversation, ctx);
    if (!location) {
      await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
        reply_markup: AuthUserKeyboard(),
      });
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
    if (!survey_id) {
      await ctx.reply(SURVEY_USER_SCENE.SOME_ERROR, {
        reply_markup: AuthUserKeyboard(),
      });
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
      return ctx.reply(
        //`Оператор @${'andrei_s086'} ${SURVEY_USER_SCENE.SUCCESS}`,
        `${SURVEY_USER_SCENE.SUCCESS}`,
        { reply_markup: AuthUserKeyboard() },
      );
    } else {
      return ctx.reply(SURVEY_USER_SCENE.FAILED, {
        reply_markup: AuthUserKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in survey: " + error);
    await ctx.reply(RESPONSES.SOME_ERROR);
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
    logger.info("stepRegion: Ошибка:", error);
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
  } catch (err) {
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
    logger.error(error);

    return false;
  }
}
