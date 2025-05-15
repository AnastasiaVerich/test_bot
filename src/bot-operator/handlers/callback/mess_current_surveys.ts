import {MyContext} from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import {getUserId} from "../../../bot-common/utils/getUserId";
import {HANDLER_CURRENT_SURVEYS} from "../../../bot-common/constants/handler_messages";
import {NewSurveysKeyboard} from "../../../bot-common/keyboards/inlineKeyboard";
import {getAllActiveSurveysUnreservedByOperatorId} from "../../../database/queries_kysely/survey_active";


export const currentSurveysHandler = async (ctx: MyContext) => {
    try {

        const operator_id = await getUserId(ctx)
        if (!operator_id) return

        const currentActiveSurveys = await getAllActiveSurveysUnreservedByOperatorId(operator_id)

        if (currentActiveSurveys.length === 0) {
            await ctx.reply(HANDLER_CURRENT_SURVEYS.NO_CURRENT_SURVEYS)
            return
        }

        const wordStr = currentActiveSurveys.map(e =>
            ({
                label: e.tg_account
                    ? `${HANDLER_CURRENT_SURVEYS.TG_ACC} ${e.tg_account}`
                    : `${HANDLER_CURRENT_SURVEYS.CODE_WORD} ${e.code_word}`,
                value:`CURRENT_SURVEY_ACTIVE${e.survey_active_id}CURRENT_SURVEY_ACTIVE`
            })
        )

        await ctx.reply(HANDLER_CURRENT_SURVEYS.HEADER, {
            parse_mode: "HTML",
            reply_markup: NewSurveysKeyboard(wordStr),
        });

    } catch (error) {
        logger.error("Error in currentSurveysHandler: " + error);
        await ctx.reply(HANDLER_CURRENT_SURVEYS.SOME_ERROR);
    }
}
