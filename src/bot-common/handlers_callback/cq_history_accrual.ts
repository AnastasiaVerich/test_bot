import { Message } from "grammy/types";
import { entitiesType, MyContext } from "../types/type";
import { getUserId } from "../utils/getUserId";
import {
  getAllReferralRewards,
  getAllSurveyRewards,
} from "../../database/services/paymentService";
import { HANDLER_HISTORY_ACCRUAL } from "../constants/handler_callback_queries";
import { formatTimestamp } from "../../lib/date";
import { AccrualHistoryMenuInlineKeyboard } from "../keyboards/inlineKeyboard";
import logger from "../../lib/logger";

export async function handler_cq_history_accrual(
  ctx: MyContext,
  role: entitiesType,
): Promise<Message.TextMessage | void> {
  try {
    // Получаем ID текущего пользователя Telegram.
    const user_id = await getUserId(ctx);

    if (!user_id) return;

    const completions_surveys = await getAllSurveyRewards(user_id, role);

    // Форматируем завершенные платежи
    const survey_accrual_history_show =
      completions_surveys.length > 0
        ? completions_surveys
            .slice(0, 20) // Ограничиваем до 5 последних операций
            .map((e) => {
              const amount = e.reward_user;
              return `💸 *${amount} ${HANDLER_HISTORY_ACCRUAL.RUB}.* — ${formatTimestamp(Number(e.completed_at))}`;
            })
            .join("\n")
        : HANDLER_HISTORY_ACCRUAL.NO_ACCRUAL;

    let message = `📜 *${HANDLER_HISTORY_ACCRUAL.BALANCE_ACCRUAL_HISTORY}*\n${survey_accrual_history_show}\n\n`;

    if (role === "user") {
      const completions_referrals = await getAllReferralRewards(user_id);
      // Форматируем завершенные платежи
      const referral_history_show =
        completions_referrals.length > 0
          ? completions_referrals
              .slice(0, 10) // Ограничиваем до 10 последних операций
              .map((e) => {
                const amount = e.amount;
                return `💸 *${amount} ${HANDLER_HISTORY_ACCRUAL.RUB}.* — ${formatTimestamp(Number(e.completed_at))}`;
              })
              .join("\n")
          : HANDLER_HISTORY_ACCRUAL.NO_ACCRUAL;

      message += `\n\n🕒 *${HANDLER_HISTORY_ACCRUAL.BALANCE_ACCRUAL_REFERRAL_HISTORY}*\n${referral_history_show}`;
    }

    return ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: AccrualHistoryMenuInlineKeyboard(),
    });
  } catch (error) {
    logger.error("Error in keyboard balance: " + error);
    await ctx.reply(HANDLER_HISTORY_ACCRUAL.SOME_ERROR);
  }
}
