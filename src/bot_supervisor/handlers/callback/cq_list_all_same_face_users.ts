import os from "os";
import path from "path";
import fs from "fs/promises";
import { InputFile } from "grammy";
import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_GET_USER_LOGS } from "../../../bot-common/constants/handler_messages";
import { getSimilarUsersWithNoSupervisorCheck } from "../../../database/services/verifyUsers";
import { UsersType } from "../../../database/db-types";

export const handleCQListAllSameUsers = async (ctx: MyContext) => {
  try {
    const list = await getSimilarUsersWithNoSupervisorCheck();
    const csvContent = metricsToCsv(list);
    const tempDir = os.tmpdir();
    const fileName = `user_with_same_face_not_check_by_supervisor_${Date.now()}.csv`;
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, csvContent);

    // Отправка файла как InputFile
    await ctx.replyWithDocument(new InputFile(filePath, fileName), {
      caption:
        "Пользователи, которые имеют сходства с другими пользователями; не проверенные руководтелем",
    });

    // Удаление временного файла после отправки
    await fs.unlink(filePath).catch((err) => {
      logger.error("Ошибка при удалении временного файла: " + err);
    });
  } catch (error) {
    logger.error("Error in handleCQCheckAllSameUsers: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};

function metricsToCsv(metrics: { user_id: UsersType["user_id"] }[]): string {
  const headers = ["User ID"];

  const escapeCsv = (value: any): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = metrics.map((row) => [row.user_id].map(escapeCsv).join(","));

  return [headers.map(escapeCsv).join(","), ...rows].join("\n");
}
