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
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handleFinishSurvey } from "./callback/cq_finish_survey";
import { handleCancelSurvey } from "./callback/cq_cancel_survey";
import { handleUserWrote } from "./callback/cq_user_wrote";
import { handleGetUserSurveyInfo } from "./callback/cq_get_user_survey_info";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthOperatorKeyboard } from "../../bot-common/keyboards/keyboard";
import { recheckSurveysHandler } from "./callback/mess_recheck_surveys";
import { handleRecheckThisSurvey } from "./callback/cq_get_recheck_this_survey";
import { handleMessageBalance } from "../../bot-common/handlers_callback/message__balance";
import { handler_cq_history_withdrawal } from "../../bot-common/handlers_callback/cq_history_withdrawal";
import { handler_cq_history_accrual } from "../../bot-common/handlers_callback/cq_history_accrual";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelConversations(
      ctx,
      ScenesOperator,
      AuthOperatorKeyboard(),
      true,
    );
    await handleStartCommand(ctx);
  });
  bot.command("chatid", async (ctx) => {
    await cancelConversations(
      ctx,
      ScenesOperator,
      AuthOperatorKeyboard(),
      true,
    );
    await handleChatidCommand(ctx);
  });
  bot.command("clean", (ctx) =>
    cancelConversations(ctx, ScenesOperator, AuthOperatorKeyboard()),
  );
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
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisSurveyNeedRecheck),
      handleRecheckThisSurvey,
    );

  bot
    .chatType("channel")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.TookButton,
      async (ctx: MyContext) => {
        await handleTookSurvey(ctx, bot);
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await ctx.conversation.enter(ScenesOperator.WithdrawalScene);
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
      async (ctx: MyContext) => {
        await handler_cq_history_accrual(ctx, "operator");
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await handler_cq_history_withdrawal(ctx, "operator");
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.NewSurveys) {
      await newSurveysHandler(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.CurrentSurveys) {
      await currentSurveysHandler(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
      await handleMessageBalance(ctx, "operator");
    } else if (ctx.message.text === BUTTONS_KEYBOARD.RecheckSurveys) {
      await recheckSurveysHandler(ctx);
    }
  });
}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {}
