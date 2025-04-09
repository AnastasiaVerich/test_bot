import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {MyContext} from "../../types/type";
import {checkBalance} from "../../../database/queries/balanceQueries";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";
import {selectWithdrawalLogByUserId} from "../../../database/queries/withdrawalLogsQueries";
import {formatTimestamp} from "../../../lib/date";
import logger from "../../../lib/logger";
import {getUserId} from "../../utils/getUserId";
import {findPendingPaymentByUserId} from "../../../database/queries/pendingPaymentsQueries";

export async function handleBalance(
    ctx: MyContext,
): Promise<Message.TextMessage | void> {
    try {
        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const balance = await checkBalance(userId);
        const logs = await selectWithdrawalLogByUserId(userId);
        const pendingPayment = await findPendingPaymentByUserId(userId);

        logger.info(logs)
        logger.info(pendingPayment)
        // Форматируем завершенные платежи
        const logs_show = logs.length > 0
            ? logs
                .slice(0, 5) // Ограничиваем до 5 последних операций
                .map((e) => {
                    const amount = e.amount
                    const wallet = e.wallet.length > 12 ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}` : e.wallet; // Сокращаем длинный кошелек
                    return `💸 *${amount} TON* — ${formatTimestamp(Number(e.withdrawn_at))} — ${wallet}`;
                })
                .join('\n')
            : 'Нет завершенных платежей';

        // Форматируем ожидающие платежи
        const pendingPayment_show = pendingPayment.length > 0
            ? pendingPayment
                .map((e) => {
                    const amount = e.amount
                    const address = e.address.length > 12 ? `${e.address.slice(0, 6)}...${e.address.slice(-6)}` : e.address;
                    return `⏳ *${amount} TON* — ${address}`;
                })
                .join('\n')
            : 'Нет ожидающих платежей';


        if (!balance) {
            return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
        }

        const message = `💰 *${MESSAGES.BALANCE}*:${balance.balance}\n\n` +
            `📜 *${MESSAGES.BALANCE_HISTORY}*\n${logs_show}` +
            `🕒 *${MESSAGES.BALANCE_PENDING}*\n${pendingPayment_show}`
        if (Number(balance.balance) === 0) {
            return ctx.reply(message);
        } else {
            return ctx.reply(message,
                {
                    reply_markup: new InlineKeyboard().text(
                        BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
                        BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
                    ),
                },
            );
        }
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
