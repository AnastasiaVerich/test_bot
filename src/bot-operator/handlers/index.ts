import {Bot} from "grammy";
import {handleStartCommand} from "./callback/command_start";
import {ScenesOperator} from "../scenes";
import {handleChatidCommand} from "./callback/command_chatid";
import {handleTookSurvey} from "./callback/handle_took_survey";
import {BUTTONS_CALLBACK_QUERIES, BUTTONS_KEYBOARD} from "../../bot-common/constants/buttons";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";
import {
    deleteSurveyInActive,
    getActiveSurveyByOperatorId, getActiveSurveyBySurveyActiveId,
    getSurveyActiveInfo,
    getSurveyTasks,
    updateActiveSurveyReservationEnd
} from "../../database/queries/surveyQueries";
import {getUserId} from "../../bot-common/utils/getUserId";
import {FinishSurveyKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {ScenesUser} from "../../bot-user/scenes";
import {newSurveysHandler} from "./callback/mess_new_surveys";
import {newSecureWords} from "@ton/crypto";
import {currentSurveysHandler} from "./callback/mess_current_surveys";
import {xls_parser} from "../../services/xls_parser";


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
        /NEW_SURVEY_ACTIVE\d+NEW_SURVEY_ACTIVE/,
        async (ctx: MyContext) => {
            const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
            if (!callbackData) {
                await ctx.answerCallbackQuery("Ошибка: данные не получены");
                return;
            }

            // Извлекаем survey_active_id (число) из callbackData
            const match = callbackData.match(/NEW_SURVEY_ACTIVE(\d+)NEW_SURVEY_ACTIVE/);
            if (!match) {
                await ctx.answerCallbackQuery("Ошибка: неверный формат данных");
                return;
            }
            const surveyActiveId = parseInt(match[1], 10); // Получаем число из группы захвата

            const newSurveyActive = await  updateActiveSurveyReservationEnd(surveyActiveId)
            if(newSurveyActive){
                let message = `Вы отметили, что пользователь `
                const username = newSurveyActive.tg_account
                if(username){
                    message += '@'+username+' написал.'
                }
                const codeword = newSurveyActive.code_word
                if(codeword){
                    message += 'с кодовым словом '+codeword+' написал.'
                }

                await ctx.reply(message);

            }


        },
    );


    bot.chatType("private").callbackQuery(
        /CURRENT_SURVEY_ACTIVE\d+CURRENT_SURVEY_ACTIVE/,
        async (ctx: MyContext) => {
            const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
            if (!callbackData) {
                await ctx.answerCallbackQuery("Ошибка: данные не получены");
                return;
            }

            // Извлекаем survey_active_id (число) из callbackData
            const match = callbackData.match(/CURRENT_SURVEY_ACTIVE(\d+)CURRENT_SURVEY_ACTIVE/);
            if (!match) {
                await ctx.answerCallbackQuery("Ошибка: неверный формат данных");
                return;
            }
            const surveyActiveId = parseInt(match[1], 10); // Получаем число из группы захвата

            const active_survey = await getActiveSurveyBySurveyActiveId(surveyActiveId)
            if (!active_survey) return

            const surveyActiveInfo = await getSurveyActiveInfo(active_survey.survey_active_id)
            if (!surveyActiveInfo) return

            const surveyActiveTasks = await getSurveyTasks(active_survey.survey_id)
            let message = [
                `<b>📋 Опрос</b>`,
                //`<b>📋 Опрос: ${surveyActive.topic}</b>`,
                //`<b>Тип:</b> ${surveyActive.survey_type}`,
                //`<b>Описание:</b> ${surveyActive.description}`,
                `<b>Геолокация опроса:</b> ${surveyActiveInfo.region_name}`,
                `<b>Геолокация пользователя:</b> ${active_survey.user_location}`,
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
    bot.on("message:text", async (ctx) => {

        if (ctx.message.text === BUTTONS_KEYBOARD.NewSurveys) {
            await newSurveysHandler(ctx)
        } else if (ctx.message.text === BUTTONS_KEYBOARD.CurrentSurveys) {
            await currentSurveysHandler(ctx)

        }
    });

    bot.on('message:document', async (ctx) => {
        await xls_parser(ctx, bot)

    });
}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {

}

