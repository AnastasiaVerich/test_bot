import { InlineKeyboard } from "grammy";
import { Message } from "grammy/types";
import { formatTimestamp } from "../../../lib/date";
import logger from "../../../lib/logger";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { HANDLER_HISTORY_ACCRUAL } from "../../../bot-common/constants/handler_callback_queries";
import { MyContext } from "../../../bot-common/types/type";
import { getAuditSurveyCompletionsByAuditorId } from "../../../database/queries_kysely/audit_survey_task_completions";

export async function handler_history_accrual(
  ctx: MyContext,
): Promise<Message.TextMessage | void> {
  try {
    // Получаем ID текущего пользователя Telegram.
    const auditorId = await getUserId(ctx);

    if (!auditorId) return;

    const surveyAccrualHistory =
      await getAuditSurveyCompletionsByAuditorId(auditorId);
    // Форматируем завершенные платежи
    const surveyAccrualHistory_show =
      surveyAccrualHistory.length > 0
        ? surveyAccrualHistory
            .slice(0, 20) // Ограничиваем до 20 последних операций
            .map((e) => {
              const amount = e.reward_auditor;
              return `💸 *${amount} ${HANDLER_HISTORY_ACCRUAL.RUB}.* — ${formatTimestamp(Number(e.created_at))}`;
            })
            .join("\n")
        : HANDLER_HISTORY_ACCRUAL.NO_ACCRUAL;

    const message = `📜 *${HANDLER_HISTORY_ACCRUAL.BALANCE_ACCRUAL_HISTORY}*\n${surveyAccrualHistory_show}\n\n`;

    return ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(
          BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
          BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
        )
        .row()
        .text(
          BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButtonText,
          BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
        ),
    });
  } catch (error) {
    logger.error("Error in keyboard balance: " + error);
    await ctx.reply(HANDLER_HISTORY_ACCRUAL.SOME_ERROR);
  }
}
