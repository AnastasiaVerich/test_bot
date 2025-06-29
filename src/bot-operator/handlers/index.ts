import { Bot } from "grammy";
import { handleCommandStartOperator } from "./callback/command_start";
import { ScenesOperator } from "../scenes";
import { handleCQTookSurvey } from "./callback/cq_handle_took_survey";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { MyContext } from "../../bot-common/types/type";
import { handleMessageNewSurveys } from "./callback/message_new_surveys";
import { handleMessageCurrentSurveys } from "./callback/message_current_surveys";
import { createCallbackRegex } from "../../utils/callBackRegex";
import { handleCQFinishSurvey } from "./callback/cq_finish_survey";
import { handleCQCancelSurvey } from "./callback/cq_cancel_survey";
import { handleCQUserWrote } from "./callback/cq_user_wrote";
import { handleGetUserSurveyInfo } from "./callback/cq_get_user_survey_info";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthOperatorKeyboard } from "../../bot-common/keyboards/keyboard";
import { handleRecheckSurveys } from "./callback/message_recheck_surveys";
import { handleCQRecheckThisSurvey } from "./callback/cq_recheck_this_survey";
import { handleMessageBalance } from "../../bot-common/handlers_callback/message__balance";
import { handlerCQHistoryWithdrawal } from "../../bot-common/handlers_callback/cq_history_withdrawal";
import { handleCQHistoryAccrual } from "../../bot-common/handlers_callback/cq_history_accrual";
import { handleChannelPostPhoto } from "../../bot-common/handlers_callback/channel_post__photo";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.chatType("private").command("start", async (ctx) => {
    await cancelConversations(
      ctx,
      ScenesOperator,
      AuthOperatorKeyboard(),
      true,
    );
    await handleCommandStartOperator(ctx);
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
      handleCQFinishSurvey,
    );
  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.CancelSurveyButton),
      handleCQCancelSurvey,
    );

  bot
    .chatType("private")
    .callbackQuery(
      createCallbackRegex(BUTTONS_CALLBACK_QUERIES.ThisUserWrote),
      handleCQUserWrote,
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
      handleCQRecheckThisSurvey,
    );

  bot
    .chatType("channel")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.TookButton,
      async (ctx: MyContext) => {
        await handleCQTookSurvey(ctx, bot);
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
        await handleCQHistoryAccrual(ctx, "operator");
      },
    );

  bot
    .chatType("private")
    .callbackQuery(
      BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
      async (ctx: MyContext) => {
        await handlerCQHistoryWithdrawal(ctx, "operator");
      },
    );
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on("message:text", async (ctx) => {
    if (ctx.message.text === BUTTONS_KEYBOARD.NewSurveys) {
      await handleMessageNewSurveys(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.CurrentSurveys) {
      await handleMessageCurrentSurveys(ctx);
    } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
      await handleMessageBalance(ctx, "operator");
    } else if (ctx.message.text === BUTTONS_KEYBOARD.RecheckSurveys) {
      await handleRecheckSurveys(ctx);
    }
  });

  bot.on("channel_post:photo", async (ctx: MyContext) => {
    await handleChannelPostPhoto(ctx, "operator");
  });
}
//ОБЯЗАТЕЛЬНО ДЛЯ БОТА СДЛЕАТЬ НАСТРОЙКУ Group Privacy
export function registerChatEvents(bot: Bot<MyContext>): void {}
