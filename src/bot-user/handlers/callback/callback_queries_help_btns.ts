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

export async function handler_help_btns(
    ctx: MyContext,
    text: string,
    keyboard: InlineKeyboard
): Promise<Message.TextMessage | void> {
    try {
        await ctx.editMessageText(text, {
            parse_mode: "HTML",
            reply_markup: keyboard,
        });
    } catch (error: any) {
        // Проверим код ошибки Telegram
        if (error.description?.includes("message can't be edited")) {
            await ctx.reply(text, {
                parse_mode: "HTML",
                reply_markup: keyboard,
            });
        } else {
            await ctx.reply("Произошла ошибка при попытке показать информацию.");
        }
    }
}
