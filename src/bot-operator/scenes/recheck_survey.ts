import { InputFile } from "grammy";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { AuthOperatorKeyboard } from "../../bot-common/keyboards/keyboard";
import { RECHECK_SURVEY_OPERATOR_SCENE } from "../../bot-common/constants/scenes";
import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getOperatorByIdPhoneOrTg } from "../../database/queries_kysely/operators";
import { getAllSurveyTasks } from "../../database/queries_kysely/survey_tasks";
import {
  getInfoAboutSurvey,
  userRecheckSurvey,
} from "../../database/services/surveyService";
import { AuditorSurveyTaskCompletionsType } from "../../database/db-types";
import { getRecheckSurveyByRecheckId } from "../../database/queries_kysely/recheck_survey";
import { getAuditSurveyCompletionsById } from "../../database/queries_kysely/audit_survey_task_completions";
import { confirmStep } from "../../bot-auditor/scenes/common_step/conform_or_not";
import {
  TaskResult,
  tasks_result,
} from "../../bot-auditor/scenes/common_step/tasks_result";
import { getVideoByVideoId } from "../../database/queries_kysely/videos";

export async function recheckSurveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  arg: { state: { recheckSurveyId: number } },
) {
  let recheckSurveyId = arg.state.recheckSurveyId;
  try {
    let result: Array<
      TaskResult & {
        completion_id: number | null;
        isSameAnswers: boolean;
      }
    > = await conversation.external(() => []);
    let intermediate_result: TaskResult[] = await conversation.external(
      () => [],
    );

    const operator_id = await conversation.external(() => getUserId(ctx));
    if (!operator_id) return;

    const operator = await getOperatorByIdPhoneOrTg({
      operator_id: operator_id,
    });
    if (!operator) {
      return;
    }

    const recheckSurvey = await getRecheckSurveyByRecheckId(recheckSurveyId);
    if (!recheckSurvey || !recheckSurvey.user_id || !recheckSurvey.video_id) {
      return ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: { remove_keyboard: true },
      });
    }
    if (recheckSurvey.video_id == null) {
      return ctx.reply("Видео нет.");
    }
    const video = await getVideoByVideoId(recheckSurvey.video_id);
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

    interface auditorResultInterface {
      [key: string]: AuditorSurveyTaskCompletionsType; // Для хранения состояния сцен
    }
    const auditorResult: auditorResultInterface = {};
    for (const el of recheckSurvey.audit_task_ids) {
      const res = await getAuditSurveyCompletionsById(el);
      if (res) {
        auditorResult[res.survey_task_id] = res;
      }
    }

    const surveyData = await getInfoAboutSurvey(recheckSurvey.survey_id);
    if (!surveyData) {
      return ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: { remove_keyboard: true },
      });
    }
    const survey_tasks = await conversation.external(() =>
      getAllSurveyTasks(recheckSurvey.survey_id),
    );

    intermediate_result = await tasks_result(
      conversation,
      ctx,
      survey_tasks,
      surveyData.task_price,
    );
    for (const operatorAnswer of intermediate_result) {
      const index = intermediate_result.indexOf(operatorAnswer);
      const auditorAnswer = auditorResult?.[operatorAnswer.survey_task_id] ?? {
        result: null,
        result_positions_var: null,
      };
      const completion_id = auditorAnswer?.completion_id ?? null;

      const isSameAnswers =
        operatorAnswer.result_positions ===
          auditorAnswer.result_positions_var &&
        operatorAnswer.result === auditorAnswer.result;
      result[index] = {
        ...operatorAnswer,
        completion_id: completion_id,
        isSameAnswers: isSameAnswers,
      };
    }

    const resultConfirm = await confirmStep(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: AuthOperatorKeyboard(),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      await userRecheckSurvey(
        {
          delete_id: recheckSurvey.recheck_survey_id,
          user_id: recheckSurvey.user_id,
          survey_id: recheckSurvey.survey_id,
          operator_id: operator_id,
          video_id: recheckSurvey.video_id,
        },
        result,
      );

      return ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.SUCCESS, {
        reply_markup: AuthOperatorKeyboard(),
      });
    } else {
      return ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.CANCELLED, {
        reply_markup: AuthOperatorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in finishSurveyScene: " + error);
    return ctx.reply(RECHECK_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  }
}
