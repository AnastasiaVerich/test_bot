import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { AuthAuditorKeyboard } from "../../bot-common/keyboards/keyboard";
import { CHECK_SURVEY_AUDITOR_SCENE } from "../../bot-common/constants/scenes";
import {
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getVideoByVideoId } from "../../database/queries_kysely/videos";
import { SurveyCompletionsType } from "../../database/db-types";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { getAuditSurveyActiveByAuditorId } from "../../database/queries_kysely/audit_survey_active";
import { getInfoAboutSurvey } from "../../database/services/surveyService";
import { getAllSurveyTasks } from "../../database/queries_kysely/survey_tasks";
import { auditorCompletedAuditSurvey } from "../../database/services/auditService";
import { getSurveyTaskCompletionByCompletionId } from "../../database/queries_kysely/survey_task_completions";
import { confirmStep } from "./common_step/conform_or_not";
import { TaskResult, tasks_result } from "./common_step/tasks_result";

export async function checkSurveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
) {
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

    const auditor_id = await conversation.external(() => getUserId(ctx));
    if (!auditor_id) return;

    const auditSurveyActive = await getAuditSurveyActiveByAuditorId(auditor_id);
    if (!auditSurveyActive) {
      return ctx.reply("Нет опросов для проверки");
      //что-то придумать.
    }
    if (!auditSurveyActive.user_id || !auditSurveyActive.operator_id) {
      return ctx.reply("Что-то пошло не так");
      //что-то придумать.
    }

    if (auditSurveyActive.video_id == null) {
      return ctx.reply("Видео нет.");
    }

    const video = await getVideoByVideoId(auditSurveyActive.video_id);
    // if (!video || !video.video_data || !video.file_name) {
    //   return ctx.reply("Видео для этого опроса не найдено.");
    // }
    //
    // const fileName = `survey.mp4`;
    // const inputFile = new InputFile(video.video_data, fileName);
    await ctx.reply("Ожидайте, видео отправляется ...");
    if (video?.file_id_auditor) {
      const videoReply = await ctx.replyWithVideo(video?.file_id_auditor, {
        caption: `Видео для опроса`,
      });
      if (!videoReply || !videoReply.message_id) {
        return ctx.reply("видео не отправилось");
      }
    } else {
      return ctx.reply("видео не отправилось");
    }

    interface operatorResultInterface {
      [key: string]: SurveyCompletionsType; // Для хранения состояния сцен
    }
    const operatorResult: operatorResultInterface = {};
    for (const el of auditSurveyActive.task_completions_ids) {
      const res = await getSurveyTaskCompletionByCompletionId(el);
      if (res) {
        operatorResult[res.survey_task_id] = res;
      }
    }

    const surveyData = await getInfoAboutSurvey(auditSurveyActive.survey_id);
    if (!surveyData) {
      return ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SURVEY_ACTIVE_NOT_FOUND, {
        reply_markup: { remove_keyboard: true },
      });
    }
    const survey_tasks = await conversation.external(() =>
      getAllSurveyTasks(auditSurveyActive.survey_id),
    );

    intermediate_result = await tasks_result(
      conversation,
      ctx,
      survey_tasks,
      surveyData.task_price,
    );
    for (const auditorAnswer of intermediate_result) {
      const index = intermediate_result.indexOf(auditorAnswer);
      const operatorAnswer = operatorResult?.[auditorAnswer.survey_task_id] ?? {
        result: null,
        result_positions_var: null,
      };
      const completion_id = operatorAnswer?.completion_id ?? null;

      const isSameAnswers =
        auditorAnswer.result_positions ===
          operatorAnswer.result_positions_var &&
        auditorAnswer.result === operatorAnswer.result;
      result[index] = {
        ...auditorAnswer,
        completion_id: completion_id,
        isSameAnswers: isSameAnswers,
      };
    }

    const resultConfirm = await confirmStep(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
        reply_markup: AuthAuditorKeyboard(),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      await auditorCompletedAuditSurvey(
        {
          delete_id: auditSurveyActive.audit_survey_active_id,
          user_id: auditSurveyActive.user_id,
          survey_id: auditSurveyActive.survey_id,
          operator_id: auditSurveyActive.operator_id,
          video_id: auditSurveyActive.video_id,
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
    logger.error("Error in checkSurveyScene: " + error);
    await ctx.reply(CHECK_SURVEY_AUDITOR_SCENE.SOME_ERROR, {
      reply_markup: AuthAuditorKeyboard(),
    });
  }
}
