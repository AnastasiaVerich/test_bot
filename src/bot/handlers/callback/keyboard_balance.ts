import {InlineKeyboard} from "grammy";
import {MyContext} from "../../types/type";
import {checkBalance} from "../../../database/queries/balanceQueries";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";


export async function handleBalance(ctx: MyContext) {

    // Получаем ID текущего пользователя Telegram.
    const userId = ctx.from?.id

    if (!userId) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }

    const balance = await checkBalance(userId)
    if (!balance) {
        return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }
    ctx.reply(
        `${MESSAGES.BALANCE} ${balance.balance}!\n\n${MESSAGES.BALANCE_HISTORY}\n${'1111'}`,
        {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText, BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton),
        }
    );

}
