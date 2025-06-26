import fs from "fs/promises";
import path from "path";
import os from "os";
import { InputFile } from "grammy";
import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_GET_USER_LOGS } from "../../../bot-common/constants/handler_messages";
import {
  getUserMoneyLogs,
  MoneyMetrics,
} from "../../../database/services/logService";
import { getUserId } from "../../../bot-common/utils/getUserId";

export const handleGetMoneyLogs = async (ctx: MyContext) => {
  try {
    const supervisor_id = await getUserId(ctx);
    if (!supervisor_id) return;
    const metrics = await getUserMoneyLogs();

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
      caption: "User Money Metrics",
    });

    // Удаление временного файла после отправки
    await fs.unlink(filePath).catch((err) => {
      logger.error("Ошибка при удалении временного файла: " + err);
    });
  } catch (error) {
    logger.error("Error in handleGetMoneyLogs: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};

function metricsToCsv(metrics: MoneyMetrics[]): string {
  const headers = [
    "User ID",
    "Current balance",
    "Total withdrawn rub",
    "Total survey earnings",
    "Total referral earnings",
    "Total earned",
    "Potential balance",
    "Balance difference",
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
      row.current_balance,
      row.total_withdrawn_rub,
      row.total_survey_earnings,
      row.total_referral_earnings,
      row.total_earned,
      row.potential_balance,
      row.balance_difference,
    ]
      .map(escapeCsv)
      .join(","),
  );

  return [headers.map(escapeCsv).join(","), ...rows].join("\n");
}
