import {Bot} from "grammy";
import {handleStartCommand} from "./callback/command_start";
import {ScenesOperator} from "../scenes";
import {handleChatidCommand} from "./callback/command_chatid";
import {handleTookSurvey} from "./callback/handle_took_survey";
import {BUTTONS_CALLBACK_QUERIES} from "../../bot-common/constants/buttons";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";
import {
    deleteSurveyInActive,
    getActiveSurveyByOperatorId,
    getSurveyActiveInfo,
    getSurveyTasks,
    updateActiveSurveyReservationEnd
} from "../../database/queries/surveyQueries";
import {getUserId} from "../../bot-common/utils/getUserId";
import {FinishSurveyKeyboard} from "../../bot-common/keyboards/inlineKeyboard";


export function registerCommands(bot: Bot<MyContext>): void {
    bot.chatType("private").command("start", handleStartCommand);
    bot.command("chatid", handleChatidCommand);
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
    bot.chatType("private").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.RegistrationButton,
        async (ctx: MyContext) => {
            await ctx.conversation.enter(ScenesOperator.RegisterScene);
        },
    );
    bot.chatType("private").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.FinishSurveyButton,
        async (ctx: MyContext) => {
            logger.info(111)
            await ctx.conversation.enter(ScenesOperator.FinishSurveyScene);
        },
    );
    bot.chatType("private").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.CancelSurveyButton,
        async (ctx: MyContext) => {
            logger.info(222)

            const operatorId = await getUserId(ctx)
            if(!operatorId)return

            const activeSurvey =await getActiveSurveyByOperatorId(operatorId)

            if(!activeSurvey) return
            await deleteSurveyInActive(activeSurvey.survey_active_id)
            ctx.reply('Опрос успешно отменен')

        },
    );

    bot.chatType("private").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.UserWriteButton,
        async (ctx: MyContext) => {

            const operatorId = await getUserId(ctx)
            if (!operatorId) return

            const active_survey = await getActiveSurveyByOperatorId(operatorId)
            if (!active_survey) return

            const surveyActiveInfo = await getSurveyActiveInfo(active_survey.survey_active_id)
            if (!surveyActiveInfo) return

            const surveyActiveTasks = await getSurveyTasks(active_survey.survey_id)
            await  updateActiveSurveyReservationEnd(active_survey.survey_active_id)

            let message = [
                `<b>📋 Опрос</b>`,
                //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
                //`<b>Тип:</b> ${surveyActive.survey_type}`,
                //`<b>Описание:</b> ${surveyActive.description}`,
                `<b>Геолокация:</b> ${surveyActiveInfo.region_name}`,
                `<b>Цена за задание:</b> ${surveyActiveInfo.task_price}`,
                `` // Empty line for spacing
            ].join('\n');

            message += '\n\n<b>📝 Задания:</b>\n';
            surveyActiveTasks.forEach((task, index) => {
                message += `<b>${index+1}:</b> ${task.description.replaceAll('/n','\n')}\n`;
            });
            await ctx.reply(`${message}`, {parse_mode: 'HTML'})

            await ctx.reply('После окончания опроса нажми на кнопку завершения.',
                {reply_markup: FinishSurveyKeyboard()})

        },
    );

    bot.chatType("channel").callbackQuery(
        BUTTONS_CALLBACK_QUERIES.TookButton,
        async (ctx: MyContext) => {
             await handleTookSurvey(ctx, bot)
        },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {

}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {

}

