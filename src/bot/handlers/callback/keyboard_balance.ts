import {InlineKeyboard} from "grammy";
import {MyContext} from "../../types/type";
import {checkBalance} from "../../../database/queries/balanceQueries";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";
import {selectWithdrawalLogByUserId} from "../../../database/queries/withdrawalLogsQueries";
import {formatTimestamp} from "../../../lib/date";


export async function handleBalance(ctx: MyContext) {

    // Получаем ID текущего пользователя Telegram.
    const userId = ctx.from?.id

    if (!userId) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }

    const balance = await checkBalance(userId)
    const logs = await selectWithdrawalLogByUserId(userId)
    if (!balance) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }
    console.log(balance)
    if(Number(balance.balance) === 0){
        await ctx.reply(
            `${MESSAGES.BALANCE} ${balance.balance}!\n\n${MESSAGES.BALANCE_HISTORY}\n${logs.map(e=>`${e.amount} ${formatTimestamp(Number(e.withdrawn_at))}`)}`,
        );
    } else{
        await  ctx.reply(
            `${MESSAGES.BALANCE} ${balance.balance}!\n\n${MESSAGES.BALANCE_HISTORY}\n${'1111'}`,
            {
                reply_markup: new InlineKeyboard()
                    .text(BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText, BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton),
            }
        );
    }


}
