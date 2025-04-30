import {Bot} from "grammy";
import {handleStartCommand} from "./callback/command_start";
import {ScenesOperator} from "../scenes";
import {handleChatidCommand} from "./callback/command_chatid";
import {handleMessageForward} from "./callback/message_forward";
import {BUTTONS_CALLBACK_QUERIES} from "../../bot-common/constants/buttons";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";
import {deleteSurveyInActive, getActiveSurveyByOperatorId} from "../../database/queries/surveyQueries";
import {getUserId} from "../../bot-common/utils/getUserId";


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
}

export function registerMessage(bot: Bot<MyContext>): void {
// Обработка пересланных сообщений
    bot.chatType("private")
        .on("message:forward_origin", async (ctx: MyContext) => {
        await handleMessageForward(ctx, bot)
    });
}

//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {

}

