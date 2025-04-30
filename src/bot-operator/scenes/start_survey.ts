import {getUserId} from "../../bot-common/utils/getUserId";
import {
    getActiveSurveyByMessageID,
    getSurveyActiveInfo,
    getSurveyInformations,
    updateActiveSurveyOperatorId, updateActiveSurveyReservationEnd
} from "../../database/queries/surveyQueries";
import {Conversation} from "@grammyjs/conversations";
import {findOperator} from "../../database/queries/operatorQueries";
import {BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {BalanceMenu, FinishSurveyKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {ConfirmButton, ConfirmCancelButtons} from "../../bot-common/keyboards/keyboard";
import {START_SURVEY_OPERATOR_SCENE} from "../../bot-common/constants/scenes";
import {MyContext, MyConversation, MyConversationContext} from "../../bot-common/types/type";
import {channelId} from "../../config/env";

export async function startSurveyScene(
    conversation: MyConversation,
    ctx: MyConversationContext,
    params: {
        state: {
            message_id: number
        }
    }
) {
    try {
        console.log(1)
        const operatorId = await conversation.external(() => getUserId(ctx));
        if (!operatorId) return
        console.log(2)

        const messageId = params.state.message_id;
        if (!messageId) return
        console.log(3)

        const active_survey = await conversation.external(() => getActiveSurveyByMessageID(messageId))
        if (!active_survey) return
        console.log(4)

        if (active_survey.operator_id) {
            return ctx.reply(START_SURVEY_OPERATOR_SCENE.BUSY)
        }
        console.log(5)

        const operator = await conversation.external(() => findOperator(operatorId, null, null))
        if (!operator) return


        const surveyActiveInfo = await conversation.external(() => getSurveyActiveInfo(active_survey.survey_active_id))
        if (!surveyActiveInfo) return

        await conversation.external(() => updateActiveSurveyOperatorId(operatorId, active_survey.survey_active_id,surveyActiveInfo.reservation_time_min))

        await ctx.reply(
            `${START_SURVEY_OPERATOR_SCENE.TOOK_IT}`
                .replace("{tg_account}", active_survey.tg_account)
            ,
        )

        const resultConfirm = await stepConfirm(conversation, ctx, surveyActiveInfo.reservation_time_min)

        if (!resultConfirm) {
            await ctx.reply(START_SURVEY_OPERATOR_SCENE.SOME_ERROR, {
                reply_markup: {remove_keyboard:true},
            });
            return
        }

        if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
            const surveyActiveInformations = await conversation.external(() => getSurveyInformations(active_survey.survey_id))
             await conversation.external(() => updateActiveSurveyReservationEnd(active_survey.survey_active_id))
            let message = [
                `<b>📋 Опрос</b>`,
                //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
                //`<b>Тип:</b> ${surveyActive.survey_type}`,
                //`<b>Описание:</b> ${surveyActive.description}`,
                `<b>Геолокация:</b> ${surveyActiveInfo.region_name}`,
                `<b>Цена за задание:</b> ${surveyActiveInfo.task_price}`,
                `` // Empty line for spacing
            ].join('\n');

            message += '\n\n<b>📝 Информация:</b>\n';
            surveyActiveInformations.forEach((task, index) => {
                message += `<b>${task.label}:</b> ${task.description}\n`;
            });
            await ctx.reply(`${message}`, {parse_mode: 'HTML'})

            await ctx.reply('После окончания опроса нажми на кнопку завершения.',
                {reply_markup: FinishSurveyKeyboard()})
            await ctx.api.deleteMessage(channelId, messageId);


        } else if(resultConfirm === BUTTONS_KEYBOARD.SkipButton){
            console.log('exit')
            return
        }


    } catch (error) {
        console.log(error)
    }
}


async function stepConfirm(
    conversation: Conversation<MyContext, MyConversationContext>,
    ctx: MyConversationContext,
    reservation_time_min: string

) {

    try {
        await ctx.reply(
            START_SURVEY_OPERATOR_SCENE.CONFIRMATION
                .replace("{res_time}", `${reservation_time_min} мин`), {
                parse_mode: "HTML",
                reply_markup: ConfirmButton(),
            },
        );

        let result: string | null = null
        //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
        while (true) {
            console.log('123456')
            const response = await conversation.waitForHears(
                [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.SkipButton],
                {
                    otherwise: (ctx) => ctx.reply(START_SURVEY_OPERATOR_SCENE.CONFIRMATION_OTHERWISE, {
                        parse_mode: "HTML",
                        reply_markup: ConfirmButton(),
                    }),
                });

            if (!response.message?.text) break

            result = response.message?.text;
            break
        }

        if (!result) return null
        return result;
    } catch (error) {
        console.log(error)
        return null;
    }
}


