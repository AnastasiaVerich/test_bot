import logger from "../../lib/logger";
import {getUserId} from "../../bot-common/utils/getUserId";
import {completeSurvey, getActiveSurveyByOperatorId} from "../../database/queries/surveyQueries";
import {Conversation} from "@grammyjs/conversations";
import {findOperator} from "../../database/queries/operatorQueries";
import {BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {FinishSurveyKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {ConfirmCancelButtons} from "../../bot-common/keyboards/keyboard";
import {FINISH_SURVEY_OPERATOR_SCENE} from "../../bot-common/constants/scenes";
import {MyContext, MyConversation, MyConversationContext} from "../../bot-common/types/type";

export async function finishSurveyScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
) {
    try {
        const operator_id = await conversation.external(() => getUserId(ctx));
        if (!operator_id) return

        const operator = await findOperator(operator_id,null,null)
        if(!operator){
            return
            //что-то придумать.
        }

        const surveyActive = await getActiveSurveyByOperatorId(operator_id)
        if(!surveyActive){
            return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SURVEY_ACTIVE_NOT_FOUND, {reply_markup:{remove_keyboard:true}})
        }
        //скиньте видео
        //сколько выполнил заданий
        //подтвердить

        const count_completed = await countCompletedStep(conversation, ctx);
        if (count_completed === null) {
            await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
                reply_markup: FinishSurveyKeyboard(),
            });
            return;
        }
        console.log(1)

        const result_position = await countResultStep(conversation, ctx)

        if (!result_position) {
            await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
                reply_markup: FinishSurveyKeyboard(),
            });
            return;
        }
        console.log(2)

        const resultConfirm = await stepConfirm(conversation, ctx)
        console.log(3)

        if (!resultConfirm) {
            await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
                reply_markup: FinishSurveyKeyboard(),
            });
            return;
        }

        if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
            // Добавляем платеж в список ожидающих
            await completeSurvey(surveyActive.survey_active_id, count_completed, result_position);

            return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SUCCESS, {
                reply_markup: {remove_keyboard:true},
            });
        } else {
            return ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CANCELLED, {
                reply_markup: FinishSurveyKeyboard(),
            });
        }


    } catch (error) {
        let shortError = error instanceof Error ? error.message.substring(0, 50) : String(error).substring(0, 50);
        logger.error("Error in registrationScene: " + shortError);
        await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
            reply_markup: FinishSurveyKeyboard(),
        });
    }
}


async function countCompletedStep(
    conversation: MyConversation,
    ctx: MyConversationContext,

) {

    try {
        await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_COUNT);

        let count_completed: any = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:text", {
                otherwise: (ctx) => ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_COUNT_OTHERWISE),
            });
            const userInput = response.message?.text.trim() ?? '';
            const number = Number(userInput); // Преобразуем в целое число

            if (isNaN(number)) {
                await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTERED_NOT_CORRECT_COUNT);
                continue
            }
            count_completed = number;
            break
        }
        return count_completed;
    } catch (error) {
        return null;
    }
}

async function countResultStep(
    conversation: MyConversation,
    ctx: MyConversationContext,

) {

    try {
        console.log(888)

        await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT);

        let result_position: any = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitFor("message:text", {
                otherwise: (ctx) => ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTER_RESULT_OTHERWISE),
            });
            const userInput = response.message?.text.trim() ?? '';
            const number = Number(userInput); // Преобразуем в целое число

            if (isNaN(number)) {
                await ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.ENTERED_NOT_CORRECT_RESULT);
                continue
            }
            result_position = number;
            break
        }
        return result_position;
    } catch (error) {
        return null;
    }
}

async function stepConfirm(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
) {

    try {
        await ctx.reply(
            FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION,{
                parse_mode: "HTML",
                reply_markup: ConfirmCancelButtons(),
            },
        );

        let result: string | null = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            const response = await conversation.waitForHears(
                [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
                {
                    otherwise: (ctx) => ctx.reply(FINISH_SURVEY_OPERATOR_SCENE.CONFIRMATION_OTHERWISE, {
                        parse_mode: "HTML",
                        reply_markup: ConfirmCancelButtons(),
                    }),
                });

            if (!response.message?.text) break

            result = response.message?.text;
            break
        }

        if (!result) return null
        return result;
    } catch (error) {
        return null;
    }
}


