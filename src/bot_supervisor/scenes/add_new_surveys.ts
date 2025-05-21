import { Document } from "@grammyjs/types";
import fs from "node:fs";
import { Bot } from "grammy";
import logger from "../../lib/logger";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { ADD_NEW_SURVEYS_SCENES } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { downloadFile } from "../../utils/downloadFile";
import { getAllRegions } from "../../database/queries_kysely/region_settings";
import { addNewSurveyWithTasks } from "../../database/services/surveyService";
import { parseExcel } from "../../utils/parseExcel";

export async function addNewSurveysScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  bot: Bot<MyContext>,
) {
  try {
    const document = await enterDocument(conversation, ctx);
    if (!document) {
      await ctx.reply(ADD_NEW_SURVEYS_SCENES.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
      return;
    }
    //await xls_parser(ctx, bot, document);

    // Скачивание файла
    const filePath = `temp_${document.file_id}.xlsx`;
    const localPath = await downloadFile(document.file_id, filePath, bot);

    // Парсинг Excel
    const rows = parseExcel(localPath);
    if (rows.length === 0) {
      // Удаляем временный файл
      fs.unlinkSync(localPath);

      return ctx.reply(ADD_NEW_SURVEYS_SCENES.DOCUMENT_IS_EMPTY, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
    const errorRow = [];
    const regions = await getAllRegions();
    for (const row of rows) {
      const regionId = regions.find(
        (region) => region.region_name.trim() === row.region.trim(),
      )?.region_id;
      if (!regionId) {
        errorRow.push(row.rowNumber);
        continue;
      }

      const isAdd = await addNewSurveyWithTasks({
        region_id: regionId,
        survey_type: "test_site",
        topic: "",
        description: "",
        completion_limit: row.completion_limit,
        task_price: row.task_price,
        tasks: row.tasks,
      });

      if (!isAdd) {
        errorRow.push(row.rowNumber);
      }
    }

    // Удаление временного файла
    fs.unlinkSync(localPath);

    // Ответ пользователю
    await ctx.reply(ADD_NEW_SURVEYS_SCENES.FINISH);
    if (errorRow.length > 0) {
      await ctx.reply(
        `${ADD_NEW_SURVEYS_SCENES.NOT_SAVE} ${errorRow.join(", ")}`,
      );
    }
  } catch (error) {
    logger.error("Error in addNewSurveysScene: " + error);
    await ctx.reply(ADD_NEW_SURVEYS_SCENES.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}
async function enterDocument(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<Document | null> {
  try {
    await ctx.reply(ADD_NEW_SURVEYS_SCENES.ENTER_DOCUMENT);

    let result: any = null;

    while (true) {
      const response = await conversation.waitFor("message:document", {
        otherwise: (ctx) =>
          ctx.reply(ADD_NEW_SURVEYS_SCENES.ENTER_DOCUMENT_OTHERWISE),
      });
      result = response.message?.document;
      const fileName = result.file_name || "";

      if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
        await ctx.reply(ADD_NEW_SURVEYS_SCENES.ENTER_DOCUMENT_INVALID);
        continue;
      }
      break;
    }

    return result;
  } catch (error) {
    logger.error("Error in addNewSurveysScene: " + error);

    return null;
  }
}
