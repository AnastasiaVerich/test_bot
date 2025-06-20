import { InlineKeyboard } from "grammy";
import { Message } from "grammy/types";
import { formatTimestamp } from "../../../lib/date";
import logger from "../../../lib/logger";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { BUTTONS_CALLBACK_QUERIES } from "../../../bot-common/constants/buttons";
import { HANDLER_HISTORY_WITHDRAWAL } from "../../../bot-common/constants/handler_callback_queries";
import { MyContext } from "../../../bot-common/types/type";
import { getAllWithdrawalLogByOperatorId } from "../../../database/queries_kysely/withdrawal_logs";

export async function handler_history_withdrawal(
  ctx: MyContext,
): Promise<Message.TextMessage | void> {
  try {
    // Получаем ID текущего пользователя Telegram.
    const operatorId = await getUserId(ctx);

    if (!operatorId) return;

    const logs = await getAllWithdrawalLogByOperatorId(operatorId);

    // Форматируем завершенные платежи
    const logs_show =
      logs.length > 0
        ? logs
            .slice(0, 5) // Ограничиваем до 5 последних операций
            .map((e) => {
              const amount = e.amount;
              const wallet =
                e.wallet.length > 12
                  ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}`
                  : e.wallet; // Сокращаем длинный кошелек
              return `💸 *${amount} TON* — ${formatTimestamp(Number(e.withdrawn_at))} — ${wallet}`;
            })
            .join("\n")
        : HANDLER_HISTORY_WITHDRAWAL.NO_HISTORY_WITHDRAWAL;

    const message = `📜 *${HANDLER_HISTORY_WITHDRAWAL.BALANCE_HISTORY}*\n${logs_show}\n\n`;

    return ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: new InlineKeyboard()
        .text(
          BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
          BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
        )
        .row()
        .text(
          BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButtonText,
          BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
        ),
    });
  } catch (error) {
    logger.error("Error in keyboard balance: " + error);
    await ctx.reply(HANDLER_HISTORY_WITHDRAWAL.SOME_ERROR);
  }
}
