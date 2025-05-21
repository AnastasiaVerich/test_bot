import { Bot } from "grammy";
import { handleStartCommand } from "./callback/command_start";
import { ScenesOperator } from "../scenes";
import { handleChatidCommand } from "./callback/command_chatid";
import { handleTookSurvey } from "./callback/handle_took_survey";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { MyContext } from "../../bot-common/types/type";
import { newSurveysHandler } from "./callback/mess_new_surveys";
import { currentSurveysHandler } from "./callback/mess_current_surveys";
import { cancelOperatorConversation } from "../utils/cancelOperatorConversation";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handleFinishSurvey } from "./callback/callback_queries_finish_survey";
import { handleCancelSurvey } from "./callback/callback_queries_cancel_survey";
import { handleUserWrote } from "./callback/callback_queries_user_wrote";
import { handleGetUserSurveyInfo } from "./callback/callback_queries_get_user_survey_info";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelOperatorConversation(ctx, true);
    await handleStartCommand(ctx);
  });
  bot.command("chatid", async (ctx) => {
    await cancelOperatorConversation(ctx, true);
    await handleChatidCommand(ctx);
  });
  bot.command("clean", (ctx) => cancelOperatorConversation(ctx));
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.RegistrationButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesOperator.RegisterScene);
      },
    );
  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.FinishSurveyButton),
      handleFinishSurvey,
    );
  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.CancelSurveyButton),
      handleCancelSurvey,
    );

  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisUserWrote),
      handleUserWrote,
    );

  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisUserGetSurveyInfo),
      handleGetUserSurveyInfo,
    );

  bot
    .chatType("channel")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.TookButton,
      async (ctx: MyContext) => {
        await handleTookSurvey(ctx, bot);
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.NewSurveys) {
      await newSurveysHandler(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.CurrentSurveys) {
      await currentSurveysHandler(ctx);
    }
  });
}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {}
