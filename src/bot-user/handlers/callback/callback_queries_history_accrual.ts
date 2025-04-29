import {InlineKeyboard} from "grammy";
import {Message} from "grammy/types";
import {formatTimestamp} from "../../../lib/date";
import logger from "../../../lib/logger";
import {getUserId} from "../../../bot-common/utils/getUserId"
;
import {getSurveyAccrualHistory} from "../../../database/queries/surveyQueries";
import {getReferralAccrualHistory} from "../../../database/queries/referralQueries";
import {BUTTONS_CALLBACK_QUERIES} from "../../../bot-common/constants/buttons";
import {HANDLER_HISTORY_ACCRUAL} from "../../../bot-common/constants/handler_callback_queries";
import {MyContext} from "../../../bot-common/types/type";

export async function handler_history_accrual(
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
                    return `💸 *${amount} ${HANDLER_HISTORY_ACCRUAL.RUB}.* — ${formatTimestamp(Number(e.accrual_date))}`;
                })
                .join('\n')
            : HANDLER_HISTORY_ACCRUAL.NO_ACCRUAL;

        const accrualReferralHistory = await getReferralAccrualHistory(userId);
        // Форматируем завершенные платежи
        const accrualReferralHistory_show = accrualReferralHistory.length > 0
            ? accrualReferralHistory
                .slice(0, 20) // Ограничиваем до 5 последних операций
                .map((e) => {
                    const amount = e.amount
                    const referred_user_id = e.referred_user_id
                    return `💸 *${amount} ${HANDLER_HISTORY_ACCRUAL.RUB}.* — ${formatTimestamp(Number(e.accrual_date))}`;
                })
                .join('\n')
            : HANDLER_HISTORY_ACCRUAL.NO_REFERRAL_ACCRUAL;


        const message =
            `📜 *${HANDLER_HISTORY_ACCRUAL.BALANCE_ACCRUAL_HISTORY}*\n${surveyAccrualHistory_show}\n\n` +
            `🕒 *${HANDLER_HISTORY_ACCRUAL.BALANCE_ACCRUAL_REFERRAL_HISTORY}*\n${accrualReferralHistory_show}`

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
        await ctx.reply(HANDLER_HISTORY_ACCRUAL.SOME_ERROR);
    }
}
