import { Message } from "grammy/types";
import { entitiesType, MyContext } from "../types/type";
import { getUserId } from "../utils/getUserId";
import { getAllWithdrawalLog } from "../../database/services/paymentService";
import {
  HANDLER_BALANCE,
  HANDLER_HISTORY_WITHDRAWAL,
} from "../constants/handler_callback_queries";
import { formatTimestamp } from "../../lib/date";
import logger from "../../lib/logger";
import { WithdrawalHistoryMenuInlineKeyboard } from "../keyboards/inlineKeyboard";

export async function handlerCQHistoryWithdrawal(
  ctx: MyContext,
  role: entitiesType,
): Promise<Message.TextMessage | void> {
  try {
    // Получаем ID текущего пользователя Telegram.
    const user_id = await getUserId(ctx);

    if (!user_id) return;

    const logs = await getAllWithdrawalLog(user_id, role);

    // Форматируем завершенные платежи
    const logs_show =
      logs.length > 0
        ? logs
            .slice(0, 10) // Ограничиваем до 10 последних операций
            .map((e) => {
              const amount_ton = e.amount;
              const amount_rub = e.amount_rub;
              const wallet =
                e.wallet.length > 12
                  ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}`
                  : e.wallet; // Сокращаем длинный кошелек
              return `💸 *${amount_ton} ${HANDLER_BALANCE.TON} ${HANDLER_BALANCE.OR} ${amount_rub} ${HANDLER_BALANCE.RUB}* — ${formatTimestamp(Number(e.withdrawn_at))} — ${wallet}`;
            })
            .join("\n")
        : HANDLER_HISTORY_WITHDRAWAL.NO_HISTORY_WITHDRAWAL;

    const message = `📜 *${HANDLER_HISTORY_WITHDRAWAL.BALANCE_HISTORY}*\n${logs_show}\n\n`;

    return ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: WithdrawalHistoryMenuInlineKeyboard(),
    });
  } catch (error) {
    logger.error("Error in keyboard balance: " + error);
    await ctx.reply(HANDLER_HISTORY_WITHDRAWAL.SOME_ERROR);
  }
}
