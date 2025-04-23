import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {MyContext} from "../../types/type";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";
import {selectWithdrawalLogByUserId} from "../../../database/queries/withdrawalLogsQueries";
import {formatTimestamp} from "../../../lib/date";
import logger from "../../../lib/logger";
import {getUserId} from "../../utils/getUserId";
import {findPendingPaymentByUserId} from "../../../database/queries/pendingPaymentsQueries";
import {checkBalance} from "../../../database/queries/userQueries";
import {BalanceMenu} from "../../keyboards/inline";
import {curseTon} from "../../../config/env";

export async function handleBalance(
    ctx: MyContext,
): Promise<Message.TextMessage | void> {
    try {
        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const balance = await checkBalance(userId);
        if (!balance) {
            return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
        }
        const balanceTon = Number((balance / curseTon).toFixed(2))
        const pendingPayment = await findPendingPaymentByUserId(userId);


        // Форматируем ожидающие платежи
        const pendingPayment_show = pendingPayment.length > 0
            ? pendingPayment
                .map((e) => {
                    const amount = e.amount
                    const address = e.address.length > 12 ? `${e.address.slice(0, 6)}...${e.address.slice(-6)}` : e.address;
                    return `⏳ *${amount} РУБ* — ${address}`;
                })
                .join('\n')
            : 'Нет ожидающих платежей';





        const message = `💰 *${MESSAGES.BALANCE}*:\n ${balance} Руб или ${balanceTon} TON\n\n` +
            `🕒 *${MESSAGES.BALANCE_PENDING}*\n${pendingPayment_show}`
        if (Number(balance) === 0) {
            return ctx.reply(message, { parse_mode: 'Markdown' });
        } else {
            return ctx.reply(message,
                {
                    parse_mode: 'Markdown',
                    reply_markup: BalanceMenu()
                    ,
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
