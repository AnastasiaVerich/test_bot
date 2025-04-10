import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {MyContext} from "../../types/type";
import {BUTTONS_CALLBACK_QUERIES} from "../../constants/button";
import {MESSAGES} from "../../constants/messages";
import {formatTimestamp} from "../../../lib/date";
import logger from "../../../lib/logger";
import {getUserId} from "../../utils/getUserId";
import {getSurveyAccrualHistory} from "../../../database/queries/surveyQueries";
import {getReferralAccrualHistory} from "../../../database/queries/referralQueries";

export async function handler_history_input_balance(
    ctx: MyContext,
): Promise<Message.TextMessage | void> {
    try {
        // Получаем ID текущего пользователя Telegram.
        const userId = await getUserId(ctx);

        if (!userId) return;

        const surveyAccrualHistory = await getSurveyAccrualHistory(userId);
        // Форматируем завершенные платежи
        const surveyAccrualHistory_show = surveyAccrualHistory.length > 0
            ? surveyAccrualHistory
                .slice(0, 20) // Ограничиваем до 5 последних операций
                .map((e) => {
                    const amount = e.amount
                    return `💸 *${amount} Руб.* — ${formatTimestamp(Number(e.accrual_date))}`;
                })
                .join('\n')
            : 'Нет начислений';

        const accrualReferralHistory = await getReferralAccrualHistory(userId);
        // Форматируем завершенные платежи
        const accrualReferralHistory_show = accrualReferralHistory.length > 0
            ? accrualReferralHistory
                .slice(0, 20) // Ограничиваем до 5 последних операций
                .map((e) => {
                    const amount = e.amount
                    const referred_user_id = e.referred_user_id
                    return `💸 *${amount} Руб.* — ${formatTimestamp(Number(e.accrual_date))}`;
                })
                .join('\n')
            : 'Нет начислений за друзей';


        const message =
            `📜 *${MESSAGES.BALANCE_ACCRUAL_HISTORY}*\n${surveyAccrualHistory_show}\n\n` +
            `🕒 *${MESSAGES.BALANCE_ACCRUAL_REFERRAL_HISTORY}*\n${accrualReferralHistory_show}`

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
                        BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButtonText,
                        BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton
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
