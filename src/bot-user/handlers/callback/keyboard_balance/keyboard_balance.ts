import {MyContext} from "../../../types/type";
import logger from "../../../../lib/logger";
import {getUserId} from "../../../utils/getUserId";
import {findPendingPaymentByUserId} from "../../../../database/queries/pendingPaymentsQueries";
import {checkBalance} from "../../../../database/queries/userQueries";
import {BalanceMenu} from "../../../keyboards/inline";
import {curseTon} from "../../../../config/env";
import {HANDLER_KEYBOARD_BALANCE} from "./text";

export async function handleBalance(
    ctx: MyContext,
): Promise<any | void> {
    try {
        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const balance = await checkBalance(userId);
        if (!balance) {
            return ctx.reply(HANDLER_KEYBOARD_BALANCE.USER_ID_UNDEFINED);
        }
        const balanceTon = Number((balance / curseTon).toFixed(2))
        const pendingPayment = await findPendingPaymentByUserId(userId);


        // Форматируем ожидающие платежи
        const pendingPayment_show = pendingPayment.length > 0
            ? pendingPayment
                .map((e) => {
                    const amount = e.amount
                    const address = e.address.length > 12 ? `${e.address.slice(0, 6)}...${e.address.slice(-6)}` : e.address;
                    return `⏳ *${amount} ${HANDLER_KEYBOARD_BALANCE.RUB}* — ${address}`;
                })
                .join('\n')
            : HANDLER_KEYBOARD_BALANCE.NO_PENDING_PAYMENT;





        const message = `💰 *${HANDLER_KEYBOARD_BALANCE.BALANCE}*:\n ${balance} ${HANDLER_KEYBOARD_BALANCE.RUB} ${HANDLER_KEYBOARD_BALANCE.OR} ${balanceTon} TON\n\n` +
            `🕒 *${HANDLER_KEYBOARD_BALANCE.BALANCE_PENDING}*\n${pendingPayment_show}`
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
        await ctx.reply(HANDLER_KEYBOARD_BALANCE.SOME_ERROR);
    }
}
