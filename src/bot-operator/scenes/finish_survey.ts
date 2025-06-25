import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { FinishSurveyInlineKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import {
  AuthOperatorKeyboard,
  ConfirmCancelKeyboard,
  CreateFromWordsKeyboard,
  SkipKeyboard,
  YesNoKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { FINISH_SURVEY_OPERATOR_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getOperatorByIdPhoneOrTg } from "../../database/queries_kysely/operators";
import { getActiveSurvey } from "../../database/queries_kysely/survey_active";
import { getAllSurveyTasks } from "../../database/queries_kysely/survey_tasks";
import {
  getInfoAboutSurvey,
  userCompletedSurvey,
} from "../../database/services/surveyService";
import { SurveyTasksType } from "../../database/db-types";
import { token_operator } from "../../config/env";
import { addVideo } from "../../database/queries_kysely/videos";

export async function finishSurveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  arg: { state: { surveyActiveId: number } },
) {
  let surveyActiveId = arg.state.surveyActiveId;
  try {
    const result: {
      survey_task_id: number;
      isCompleted: boolean;
      reward_user?: number;
      reward_operator?: number;
      result?: string;
      result_positions?: string;
    }[] = await conversation.external(() => []);

    const operator_id = await conversation.external(() => getUserId(ctx));
    if (!operator_id) return;

    const operator = await getOperatorByIdPhoneOrTg({
      operator_id: operator_id,
    });
    if (!operator) {
      return;
      //что-то придумать.
    }

    const surveyActive = await getActiveSurvey({
      surveyActiveId: surveyActiveId,
    });
    if (!surveyActive) {
      return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SURVEY_ACTIVE_NOT_FOUND, {
        reply_markup: { remove_keyboard: true },
      });
    }

    const surveyData = await getInfoAboutSurvey(surveyActive.survey_id);
    if (!surveyData) {
      return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SURVEY_ACTIVE_NOT_FOUND, {
        reply_markup: { remove_keyboard: true },
      });
    }
    const survey_tasks = await conversation.external(() =>
      getAllSurveyTasks(surveyActive.survey_id),
    );

    //скиньте видео
    //сколько выполнил заданий
    //подтвердить
    for (const survey_task of survey_tasks) {
      const index = survey_tasks.indexOf(survey_task);
      const isCompleted = await completedOrNotStep(
        conversation,
        ctx,
        survey_task,
      );
      if (isCompleted === null) {
        await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
          reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
        });
        return;
      }
      if (isCompleted === BUTTONS_KEYBOARD.YesButton) {
        result[index] = {
          isCompleted: true,
          survey_task_id: survey_task.survey_task_id,
          reward_user: surveyData.task_price,
          reward_operator: surveyData.task_price / 2,
        };

        const result_position = await countResultStep(conversation, ctx);
        if (result_position === null) {
          await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
            reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
          });
          return;
        }
        result[index].result = result_position;

        const result_positions = await countResultPositionVarStep(
          conversation,
          ctx,
          survey_task.data,
        );
        if (!result_positions) {
          await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
            reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
          });
          return;
        }
        result[index].result_positions = result_positions.join(", ");
      } else {
        result[index] = {
          isCompleted: false,
          survey_task_id: survey_task.survey_task_id,
        };
      }
    }

    const videoId = await uploadVideoStep(conversation, ctx, surveyActiveId);

    const resultConfirm = await stepConfirm(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      await userCompletedSurvey(
        {
          surveyActiveId: surveyActive.survey_active_id,
          user_id: surveyActive.user_id,
          survey_id: surveyActive.survey_id,
          operator_id: operator_id,
          survey_interval: surveyData.survey_interval,
          videoId: videoId,
        },
        result,
      );

      return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SUCCESS, {
        reply_markup: AuthOperatorKeyboard(),
      });
    } else {
      return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CANCELLED, {
        reply_markup: AuthOperatorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in finishSurveyScene: " + error);
    return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
      reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
    });
  }
}

async function completedOrNotStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  survey_task: SurveyTasksType,
) {
  try {
    await ctx.reply(
      FINISH_SURVEY_OPERATOR_SCENE.ENTER_COMPLETED_OR_NOT +
        `\n\n${survey_task.description.replaceAll("/n", "\n")}`,
      {
        parse_mode: "HTML",
        reply_markup: YesNoKeyboard(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.YesButton, BUTTONS_KEYBOARD.NoButton],
        {
          otherwise: (ctx) =>
            ctx.reply(
              FINISH_SURVEY_OPERATOR_SCENE.ENTER_COMPLETED_OR_NOT_OTHERWISE,
              {
                parse_mode: "HTML",
                reply_markup: YesNoKeyboard(),
              },
            ),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    return result;
  } catch (error) {
    return null;
  }
}

async function countResultStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<string | null> {
  try {
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT);

    let result_position: any = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_OTHERWISE),
      });
      const userInput = response.message?.text.trim() ?? "";
      const number = Number(userInput); // Преобразуем в целое число

      if (isNaN(number) || number <= 0) {
        await ctx.reply(
          FINISH_SURVEY_OPERATOR_SCENE.ENTERED_NOT_CORRECT_RESULT,
        );
        continue;
      }
      result_position = number.toString();
      break;
    }
    return result_position;
  } catch (error) {
    return null;
  }
}

async function countResultPositionVarStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  data: any,
) {
  try {
    const { positions_var } = data;

    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_1, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_1: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_1 = userInput;
      break;
    }
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_2, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_2: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_2 = userInput;
      break;
    }
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_3, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_3: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_3 = userInput;
      break;
    }

    return [result_1, result_2, result_3];
  } catch (error) {
    return null;
  }
}

// Новая функция для шага загрузки видео
async function uploadVideoStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  surveyActiveId: number,
): Promise<number | null> {
  try {
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_VIDEO, {
      parse_mode: "HTML",
      reply_markup: SkipKeyboard(),
    });

    let video_id: number | null = null;
    while (true) {
      const response = await conversation.waitFor(
        ["message:video", "message:text"],
        {
          otherwise: (ctx) =>
            ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_VIDEO_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: SkipKeyboard(),
            }),
        },
      );

      // Проверяем, является ли сообщение текстом
      if (response.message?.text) {
        const text = response.message.text.trim();
        if (text === BUTTONS_KEYBOARD.SkipButton) {
          return null; // Возвращаем null, если пользователь пропустил
        }
        // Если текст не "пропустить", продолжаем цикл
        await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_VIDEO_OTHERWISE, {
          parse_mode: "HTML",
        });
        continue;
      }

      const video = response.message?.video;
      if (!video) {
        continue;
      }

      const fileId = video.file_id;
      const mimeType = video.mime_type ?? null;
      const fileName =
        video.file_name || `survey_${surveyActiveId}_${Date.now()}.mp4`;

      // Получение file_path и загрузка видео
      const file = await ctx.api.getFile(fileId);
      const fileUrl = `https://api.telegram.org/file/bot${token_operator}/${file.file_path}`;

      // Загрузка видеофайла (опционально, если нужен video_data)
      let videoData: Buffer | null = null;

      const response2 = await fetch(fileUrl);
      const arrayBuffer = await response2.arrayBuffer();
      videoData = Buffer.from(arrayBuffer);

      // Сохранение в базу данных onversation.external
      video_id = await conversation.external(() =>
        addVideo(fileId, videoData, fileName, mimeType),
      );

      await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_VIDEO_SUCCESS);
      break;
    }

    return video_id;
  } catch (error) {
    logger.error("Ошибка при загрузке видео: " + error);
    return null;
  }
}

async function stepConfirm(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION, {
      parse_mode: "HTML",
      reply_markup: ConfirmCancelKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelKeyboard(),
            }),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    return result;
  } catch (error) {
    return null;
  }
}
