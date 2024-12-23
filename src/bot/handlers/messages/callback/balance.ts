
import {InlineKeyboard} from "grammy";
import {MyContext} from "../../../../types/type";
import {checkBalance} from "../../../../database/queries/balanceQueries";
import {BUTTONS} from "../../../../constants/constants";

const BALANCE = 'На Вашем счету'
const BALANCE_HISTORY = 'История Ваших опросов и рекомендаций'

export async function handleBalance(ctx: MyContext) {

    // Получаем ID текущего пользователя Telegram.
    const userId = ctx.from?.id

    if (!userId) {
        return ctx.reply("Ошибка: не удалось получить информацию о пользователе.");
    }

    const balance = await checkBalance(userId)
    if (!balance) {
        return ctx.reply("Ошибка: не удалось получить информацию о пользователе.");
    }
    ctx.reply(
        `${BALANCE} ${balance.balance}!\n\n${BALANCE_HISTORY}\n${'1111'}`,
        {
            reply_markup: new InlineKeyboard()
                .text(BUTTONS.WithdrawalOfMoneyButtonText, BUTTONS.WithdrawalOfMoneyButton),
        }
    );

}
