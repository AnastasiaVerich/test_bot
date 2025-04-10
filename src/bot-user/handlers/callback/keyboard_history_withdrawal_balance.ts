import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {MyContext} from "../../types/type";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";
import {selectWithdrawalLogByUserId} from "../../../database/queries/withdrawalLogsQueries";
import {formatTimestamp} from "../../../lib/date";
import logger from "../../../lib/logger";
import {getUserId} from "../../utils/getUserId";

export async function handler_history_withdrawal_balance(
    ctx: MyContext,
): Promise<Message.TextMessage | void> {
    try {
        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const logs = await selectWithdrawalLogByUserId(userId);

        // Форматируем завершенные платежи
        const logs_show = logs.length > 0
            ? logs
                .slice(0, 5) // Ограничиваем до 5 последних операций
                .map((e) => {
                    const amount = e.amount
                    const wallet = e.wallet.length > 12 ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}` : e.wallet; // Сокращаем длинный кошелек
                    return `💸 *${amount} РУБ* — ${formatTimestamp(Number(e.withdrawn_at))} — ${wallet}`;
                })
                .join('\n')
            : 'Нет завершенных платежей';


        const message = `📜 *${MESSAGES.BALANCE_HISTORY}*\n${logs_show}\n\n`

        return ctx.reply(message,
            {
                parse_mode: 'Markdown',
                reply_markup: new InlineKeyboard()
                    .text(
                        BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
                        BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton
                    )
                    .row()
                    .text(
                        BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButtonText,
                        BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton
                    )
                ,
            },
        );

    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error("Error in keyboard balance: " + shortError);
        await ctx.reply(MESSAGES.SOME_ERROR);
    }
}
