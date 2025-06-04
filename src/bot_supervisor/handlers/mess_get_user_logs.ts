import fs from "fs/promises";
import path from "path";
import os from "os";
import { InputFile } from "grammy";
import { MyContext } from "../../bot-common/types/type";
import logger from "../../lib/logger";
import { HANDLER_GET_USER_LOGS } from "../../bot-common/constants/handler_messages";
import {
  getUserRegistrationMetrics,
  UserMetrics,
} from "../../database/services/logService";
import { getUserId } from "../../bot-common/utils/getUserId";

export const handleGetUserLogs = async (ctx: MyContext) => {
  try {
    const supervisor_id = await getUserId(ctx);
    if (!supervisor_id) return;
    const metrics = await getUserRegistrationMetrics();

    if (!metrics || metrics.length === 0) {
      await ctx.reply("Логи не найдены.");
      return;
    }

    const csvContent = metricsToCsv(metrics);
    const tempDir = os.tmpdir();
    const fileName = `user_metrics_${Date.now()}.csv`;
    const filePath = path.join(tempDir, fileName);
    await fs.writeFile(filePath, csvContent);

    // Отправка файла как InputFile
    await ctx.replyWithDocument(new InputFile(filePath, fileName), {
      caption: "User Registration Metrics",
    });

    // Удаление временного файла после отправки
    await fs.unlink(filePath).catch((err) => {
      logger.error("Ошибка при удалении временного файла: " + err);
    });
  } catch (error) {
    logger.error("Error in handleGetUserLogs: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};

function metricsToCsv(metrics: UserMetrics[]): string {
  const headers = [
    "User ID",
    "Phone",
    "Geolocation",
    "Registration Success",
    "Registration Date",
    "Last Geolocation",
    "Balance",
    "Total Withdrawn",
    "Survey Count",
    "Referral Count",
    "Referrals with Surveys",
  ];

  const escapeCsv = (value: any): string => {
    const str = String(value ?? "");
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = metrics.map((row) =>
    [
      row.user_id,
      typeof row.registration_number === "string"
        ? row.registration_number
        : JSON.stringify(row.registration_number),
      typeof row.registration_photo === "string"
        ? row.registration_photo
        : JSON.stringify(row.registration_photo),
      row.registration_success,
      row.registration_date,
      row.last_geolocation,
      row.balance.toString(),
      row.total_withdrawn.toString(),
      row.survey_completion_count,
      row.referral_count,
      row.referrals_with_survey_count,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.map(escapeCsv).join(","), ...rows].join("\n");
}
