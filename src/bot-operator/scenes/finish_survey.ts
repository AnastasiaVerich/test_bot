import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { FinishSurveyKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import {
  AuthOperatorKeyboard,
  ConfirmCancelButtons,
  createKeyboardFromWords,
  YesNoButtons,
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
      reward?: number;
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
          reply_markup: FinishSurveyKeyboard(surveyActiveId),
        });
        continue;
      }
      if (isCompleted === BUTTONS_KEYBOARD.YesButton) {
        result[index] = {
          isCompleted: true,
          survey_task_id: survey_task.survey_task_id,
          reward: surveyData.task_price,
          reward_operator: surveyData.task_price / 2,
        };

        const result_position = await countResultStep(conversation, ctx);
        if (!result_position) {
          await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
            reply_markup: FinishSurveyKeyboard(surveyActiveId),
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
          await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
            reply_markup: FinishSurveyKeyboard(surveyActiveId),
          });
          continue;
        }
        result[index].result_positions = result_positions.join(", ");
      } else {
        result[index] = {
          isCompleted: false,
          survey_task_id: survey_task.survey_task_id,
        };
      }
    }

    const resultConfirm = await stepConfirm(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: FinishSurveyKeyboard(surveyActiveId),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих
      await userCompletedSurvey(
        {
          surveyActiveId: surveyActive.survey_active_id,
          user_id: surveyActive.user_id,
          survey_id: surveyActive.survey_id,
          operator_id: operator_id,
          survey_interval: surveyData.survey_interval,
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
    logger.error("Error in registrationScene: " + error);
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
      reply_markup: FinishSurveyKeyboard(surveyActiveId),
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
              FINISH_SURVEY_OPERATOR_SCENE.ENTER_COMPLETED_OR_NOT_OTHERWISE,
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

      if (isNaN(number)) {
        await ctx.reply(
          FINISH_SURVEY_OPERATOR_SCENE.ENTERED_NOT_CORRECT_RESULT,
        );
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

    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_1, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_1: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: createKeyboardFromWords(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_1 = userInput;
      break;
    }
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_2, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_2: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
            reply_markup: createKeyboardFromWords(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_2 = userInput;
      break;
    }
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_POS_VAR_3, {
      reply_markup: createKeyboardFromWords(positions_var),
    });

    let result_3: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RES_POS_OTHERWISE, {
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
    await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION, {
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
            ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION_OTHERWISE, {
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
