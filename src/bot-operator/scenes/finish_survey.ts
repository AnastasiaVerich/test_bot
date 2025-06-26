import { unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { createReadStream, createWriteStream } from "fs";
import ffmpeg from "fluent-ffmpeg";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import { FinishSurveyInlineKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import {
  AuthOperatorKeyboard,
  SkipKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { FINISH_SURVEY_OPERATOR_SCENE } from "../../bot-common/constants/scenes";
import {
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
import { token_operator } from "../../config/env";
import { addVideo } from "../../database/queries_kysely/videos";
import { confirmStep } from "../../bot-auditor/scenes/common_step/conform_or_not";
import {
  TaskResult,
  tasks_result,
} from "../../bot-auditor/scenes/common_step/tasks_result";

export async function finishSurveyScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  arg: { state: { surveyActiveId: number } },
) {
  let surveyActiveId = arg.state.surveyActiveId;
  try {
    let result: TaskResult[] = [];

    const operator_id = await conversation.external(() => getUserId(ctx));
    if (!operator_id) return;

    const operator = await getOperatorByIdPhoneOrTg({
      operator_id: operator_id,
    });
    if (!operator) {
      return;
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
      return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SURVEY_DATA_NOT_FOUND, {
        reply_markup: { remove_keyboard: true },
      });
    }
    const survey_tasks = await conversation.external(() =>
      getAllSurveyTasks(surveyActive.survey_id),
    );

    result = await tasks_result(
      conversation,
      ctx,
      survey_tasks,
      surveyData.task_price,
    );

    const videoId = await uploadVideoStep(conversation, ctx, surveyActiveId);

    const resultConfirm = await confirmStep(conversation, ctx);

    if (!resultConfirm) {
      await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
      });
      return;
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      await userCompletedSurvey(
        {
          delete_id: surveyActive.survey_active_id,
          user_id: surveyActive.user_id,
          survey_id: surveyActive.survey_id,
          operator_id: operator_id,
          video_id: videoId,
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
    logger.error("Error in finishSurveyScene: " + error);
    return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
      reply_markup: FinishSurveyInlineKeyboard(surveyActiveId),
    });
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

      // Сжатие видео
      const tempInputPath = join(tmpdir(), `input_${fileId}.mp4`);
      const tempOutputPath = join(tmpdir(), `output_${fileId}.mp4`);
      await new Promise((resolve, reject) => {
        createWriteStream(tempInputPath)
          .on("finish", resolve)
          .on("error", reject)
          .end(videoData);
      });
      await new Promise((resolve, reject) => {
        ffmpeg(tempInputPath)
          .outputOptions([
            "-vcodec libx264", // Кодек H.264
            "-crf 28", // Контроль качества (28 — баланс между качеством и размером)
            "-preset fast", // Скорость сжатия
            "-vf scale=1280:720", // Уменьшение разрешения до 720p
            "-acodec aac", // Аудиокодек
            "-b:a 128k", // Битрейт аудио
          ])
          .output(tempOutputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
      });

      // Чтение сжатого видео
      videoData = await new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        createReadStream(tempOutputPath)
          .on("data", (chunk) => chunks.push(Buffer.from(chunk)))
          .on("end", () => resolve(Buffer.concat(chunks)))
          .on("error", reject);
      });

      // Удаление временных файлов
      await Promise.all([unlink(tempInputPath), unlink(tempOutputPath)]);
      // Сохранение в базу данных onversation.external
      video_id = await conversation.external(() =>
        addVideo(fileId, videoData, fileName, mimeType),
      );

      await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_VIDEO_SUCCESS);
      break;
    }

    return video_id;
  } catch (error) {
    await ctx.reply("Видео не сохранилось");
    logger.error("Ошибка при загрузке видео: " + error);
    return null;
  }
}
