import { Conversation } from "@grammyjs/conversations";
import { InputFile } from "grammy";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import {
  AuthAuditorKeyboard,
  ConfirmCancelButtons,
  createKeyboardFromWords,
  YesNoButtons,
} from "../../bot-common/keyboards/keyboard";
import { CHECK_SURVEY_AUDITOR_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getVideoByVideoId } from "../../database/queries_kysely/videos";
import { SurveyTasksType } from "../../database/db-types";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { getAuditSurveyActive } from "../../database/queries_kysely/audit_survey_active";
import { getInfoAboutSurvey } from "../../database/services/surveyService";
import { getAllSurveyTasks } from "../../database/queries_kysely/survey_tasks";
import { auditorCompletedAuditSurvey } from "../../database/services/auditService";
import { getSurveyTaskCompletionByCompletionId } from "../../database/queries_kysely/survey_task_completions";

export async function checkSurveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
  try {
    const result: {
      isCompleted: boolean;
      reward_auditor: number;
      result: string | null;
      result_positions: string | null;
      description: string | null;
      completed_id: number | null;
    }[] = await conversation.external(() => []);

    const auditor_id = await conversation.external(() => getUserId(ctx));
    if (!auditor_id) return;

    const auditSurveyActive = await getAuditSurveyActive();
    if (!auditSurveyActive) {
      return ctx.reply("Нет опросов для проверки");
      //что-то придумать.
    }

    if (auditSurveyActive.video_id == null) {
      return ctx.reply("Видео нет.");
    }

    const video = await getVideoByVideoId(auditSurveyActive.video_id);
    if (!video || !video.video_data || !video.file_name) {
      return ctx.reply("Видео для этого опроса не найдено.");
    }

    const fileName = `survey.mp4`;
    const inputFile = new InputFile(video.video_data, fileName);
    await ctx.reply("Ожидайте, видео отправляется ...");
    const videoReply = await ctx.replyWithVideo(inputFile, {
      caption: `Видео для опроса`,
    });
    if (!videoReply || !videoReply.message_id) {
      return ctx.reply("видео не отправилось");
    }

    const surveyData = await getInfoAboutSurvey(auditSurveyActive.survey_id);
    if (!surveyData) {
      return ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SURVEY_ACTIVE_NOT_FOUND, {
        reply_markup: { remove_keyboard: true },
      });
    }

    const operatorResult: any = {};
    for (const el of auditSurveyActive.task_completions_ids) {
      const res = await getSurveyTaskCompletionByCompletionId(el);
      if (res) {
        operatorResult[res.survey_task_id] = res.completion_id;
      }
    }

    const survey_tasks = await conversation.external(() =>
      getAllSurveyTasks(auditSurveyActive.survey_id),
    );

    for (const survey_task of survey_tasks) {
      const index = survey_tasks.indexOf(survey_task);
      const isCompleted = await completedOrNotStep(
        conversation,
        ctx,
        survey_task,
      );
      if (isCompleted === null) {
        await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
          reply_markup: AuthAuditorKeyboard(),
        });
        continue;
      }
      if (isCompleted === BUTTONS_KEYBOARD.YesButton) {
        result[index] = {
          isCompleted: true,
          reward_auditor: surveyData.task_price / 2,
          result: null,
          result_positions: null,
          description: null,
          completed_id: operatorResult?.[survey_task.survey_task_id] ?? null,
        };

        const result_position = await countResultStep(conversation, ctx);
        if (!result_position) {
          await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
            reply_markup: AuthAuditorKeyboard(),
          });
          continue;
        }
        result[index].result = result_position;

        const result_positions = await countResultPositionVarStep(
          conversation,
          ctx,
          survey_task.data,
        );
        if (!result_positions) {
          await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
            reply_markup: AuthAuditorKeyboard(),
          });
          continue;
        }
        result[index].result_positions = result_positions.join(", ");
      } else {
        result[index] = {
          isCompleted: false,
          reward_auditor: surveyData.task_price / 2,
          result: null,
          result_positions: null,
          description: null,
          completed_id: operatorResult?.[survey_task.survey_task_id] ?? null,
        };
      }
    }

    const resultConfirm = await stepConfirm(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
        reply_markup: AuthAuditorKeyboard(),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      await auditorCompletedAuditSurvey(
        {
          audit_survey_active_id: auditSurveyActive.audit_survey_active_id,
          auditor_id: auditor_id,
        },
        result,
      );

      return ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SUCCESS, {
        reply_markup: AuthAuditorKeyboard(),
      });
    } else {
      return ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.CANCELLED, {
        reply_markup: AuthAuditorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in CHECK_SURVEY_AUDITOR_SCENE: " + error);
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
      reply_markup: AuthAuditorKeyboard(),
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
      CHECK_SURVEY_AUDITOR_SCENE.ENTER_COMPLETED_OR_NOT +
        `\n\n${survey_task.description.replaceAll("/n", "\n")}`,
      {
        parse_mode: "HTML",
        reply_markup: YesNoButtons(),
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
              CHECK_SURVEY_AUDITOR_SCENE.ENTER_COMPLETED_OR_NOT_OTHERWISE,
              {
                parse_mode: "HTML",
                reply_markup: YesNoButtons(),
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
) {
  try {
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RESULT);

    let result_position: any = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RESULT_OTHERWISE),
      });
      const userInput = response.message?.text.trim() ?? "";
      const number = Number(userInput); // Преобразуем в целое число

      if (isNaN(number)) {
        await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTERED_NOT_CORRECT_RESULT);
        continue;
      }
      result_position = number;
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

    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RESULT_POS_VAR_1, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_1: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: createKeyboardFromWords(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_1 = userInput;
      break;
    }
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RESULT_POS_VAR_2, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_2: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: createKeyboardFromWords(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_2 = userInput;
      break;
    }
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RESULT_POS_VAR_3, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_3: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: createKeyboardFromWords(positions_var),
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

async function stepConfirm(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.CONFIRMATION, {
      parse_mode: "HTML",
      reply_markup: ConfirmCancelButtons(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelButtons(),
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
