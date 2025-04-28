import {Bot} from "grammy";
import {handleStartCommand} from "./callback/command_start";
import {ScenesOperator} from "../scenes";
import {handleChatidCommand} from "./callback/command_chatid";
import {handleMessageForward} from "./callback/message_forward";
import {getActiveSurveyByUserId, updateActiveSurveyIsJoinedToChat} from "../../database/queries/surveyQueries";
import {BUTTONS_CALLBACK_QUERIES} from "../../bot-common/constants/buttons";
import {FinishSurveyKeyboard} from "../../bot-common/keyboards/inlineKeyboard";
import {MyContext} from "../../bot-common/types/type";
import logger from "../../lib/logger";


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
            logger.info(1)
            await ctx.conversation.enter(ScenesOperator.FinishSurveyScene);
        },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
// Обработка пересланных сообщений
    bot.chatType("private").on("message:forward_origin", async (ctx: MyContext) => {
        await handleMessageForward(ctx, bot)
    });
}

//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {
    bot.on("chat_member", async (ctx) => {
        logger.info('chat_member')
        const chatMemberUpdate = ctx.chatMember;
        const newStatus = chatMemberUpdate.new_chat_member.status;
        const user = chatMemberUpdate.new_chat_member.user;

        // Проверяем, что пользователь стал участником
        if (newStatus === "member") {
            const chatId = chatMemberUpdate.chat.id;
            const userFirstName = user.first_name;
            logger.info(chatId)
            logger.info(user)
            const active_survey = await getActiveSurveyByUserId(user.id)
            if(!active_survey){
                await ctx.api.sendMessage(
                    chatId,
                    `Тебя тут не ждали.`
                );
                return
            }

            await updateActiveSurveyIsJoinedToChat(true, active_survey?.survey_active_id)
            await bot.api.sendMessage(active_survey.operator_id, 'Выслал тебе список вопросов (список не готов).')
            await bot.api.sendMessage(active_survey.operator_id, 'После окончания опроса нажми на кнопку завершения.',
                {reply_markup:FinishSurveyKeyboard()})
            // Отправляем приветственное сообщение
            await ctx.api.sendMessage(
                chatId,
                `Добро пожаловать в группу, ${userFirstName}! 🎉`
            );
        }
    });
}

