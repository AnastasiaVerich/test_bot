import logger from "../../../lib/logger";
import {HANDLER_BALANCE} from "../../../bot-common/constants/handler_callback_queries";
import {BalanceMenu} from "../../../bot-common/keyboards/inlineKeyboard";
import {MyContext} from "../../../bot-common/types/type";
import {getUserId} from "../../../bot-common/utils/getUserId";
import {getCommonVariableByLabel} from "../../../database/queries_kysely/common_variables";
import {getAllPendingPaymentByUserId} from "../../../database/queries_kysely/pending_payments";
import {getUserBalance} from "../../../database/queries_kysely/users";

export async function handleBalance(
    ctx: MyContext,
): Promise<any | void> {
    try {
        let curseInfo = await getCommonVariableByLabel('ton_rub_price')
        if(!curseInfo){
            return
        }
        const curseTon = Number(curseInfo.value)

        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const balance = await getUserBalance(userId);
        if (!balance) {
            return ctx.reply(HANDLER_BALANCE.USER_ID_UNDEFINED);
        }
        const balanceTon = Number((balance / curseTon).toFixed(2))
        const pendingPayment = await getAllPendingPaymentByUserId(userId);


        // Форматируем ожидающие платежи
        const pendingPayment_show = pendingPayment.length > 0
            ? pendingPayment
                .map((e) => {
                    const amount = e.amount
                    const address = e.address.length > 12 ? `${e.address.slice(0, 6)}...${e.address.slice(-6)}` : e.address;
                    return `⏳ *${amount} ${HANDLER_BALANCE.RUB}* — ${address}`;
                })
                .join('\n')
            : HANDLER_BALANCE.NO_PENDING_PAYMENT;





        const message = `💰 *${HANDLER_BALANCE.BALANCE}*:\n ${balance} ${HANDLER_BALANCE.RUB} ${HANDLER_BALANCE.OR} ${balanceTon} TON\n\n` +
            `🕒 *${HANDLER_BALANCE.BALANCE_PENDING}*\n${pendingPayment_show}`
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

        logger.error("Error in keyboard balance: " + error);
        await ctx.reply(HANDLER_BALANCE.SOME_ERROR);
    }
}
