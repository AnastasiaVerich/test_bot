import { Bot } from "grammy";
import { ScenesUser } from "../scenes";
import { handleStartCommand } from "./callback/command_start";
import { authMiddleware } from "../middleware/authMiddleware";
import { blacklistMiddleware } from "../middleware/blacklistMiddleware";
import { checkInitMiddleware } from "../middleware/checkInitMiddleware";
import {
  BUTTONS_CALLBACK_QUERIES,
  BUTTONS_KEYBOARD,
} from "../../bot-common/constants/buttons";
import { MyContext } from "../../bot-common/types/type";
import { handleHelpCommand } from "./callback/command_help";
import {
  HelpBackInlineKeyboard,
  HelpInlineKeyboard,
} from "../../bot-common/keyboards/inlineKeyboard";
import { COMMAND_USER_HELP } from "../../bot-common/constants/handler_command";
import { handler_help_btns } from "./callback/callback_queries_help_btns";
import { cancelConversations } from "../../bot-common/utils/cancelConversation";
import { AuthUserKeyboard } from "../../bot-common/keyboards/keyboard";
import { handleMessageBalance } from "../../bot-common/handlers_callback/message__balance";
import { handler_cq_history_withdrawal } from "../../bot-common/handlers_callback/cq_history_withdrawal";
import { handler_cq_history_accrual } from "../../bot-common/handlers_callback/cq_history_accrual";

export function registerCommands(bot: Bot<MyContext>): void {
  bot.command("start", async (ctx) => {
    await cancelConversations(ctx, ScenesUser, AuthUserKeyboard(), true);
    await handleStartCommand(ctx);
  });
  bot.command("help", async (ctx) => {
    await cancelConversations(ctx, ScenesUser, AuthUserKeyboard(), true);
    await handleHelpCommand(ctx);
  });
  bot.command("clean", (ctx) =>
    cancelConversations(ctx, ScenesUser, AuthUserKeyboard()),
  );
}

export function registerCallbackQueries(bot: Bot<MyContext>): void {
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.RegistrationButton,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(ScenesUser.RegisterScene);
    },
  );
  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.IdentificationButton,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(ScenesUser.IdentificationScene);
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await ctx.conversation.enter(ScenesUser.WithdrawalScene);
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryMoneyInputButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_cq_history_accrual(ctx, "user");
    },
  );

  bot.callbackQuery(
    BUTTONS_CALLBACK_QUERIES.HistoryWithdrawalOfMoneyButton,
    authMiddleware,
    async (ctx: MyContext) => {
      await handler_cq_history_withdrawal(ctx, "user");
    },
  );

  //help
  bot.callbackQuery(
    COMMAND_USER_HELP.FirstQuestionButton,
    async (ctx: MyContext) => {
      await handler_help_btns(
        ctx,
        COMMAND_USER_HELP.FirstQuestionAnswer,
        HelpBackInlineKeyboard(),
      );
    },
  );
  bot.callbackQuery(
    COMMAND_USER_HELP.SecondQuestionButton,
    async (ctx: MyContext) => {
      await handler_help_btns(
        ctx,
        COMMAND_USER_HELP.SecondQuestionAnswer,
        HelpBackInlineKeyboard(),
      );
    },
  );
  bot.callbackQuery(
    COMMAND_USER_HELP.ThirdQuestionButton,
    async (ctx: MyContext) => {
      await handler_help_btns(
        ctx,
        COMMAND_USER_HELP.ThirdQuestionAnswer,
        HelpBackInlineKeyboard(),
      );
    },
  );

  bot.callbackQuery(
    COMMAND_USER_HELP.LastQuestionButton,
    async (ctx: MyContext) => {
      await handler_help_btns(
        ctx,
        COMMAND_USER_HELP.LastQuestionAnswer,
        HelpBackInlineKeyboard(),
      );
    },
  );

  bot.callbackQuery(COMMAND_USER_HELP.BackButton, async (ctx: MyContext) => {
    await handler_help_btns(
      ctx,
      COMMAND_USER_HELP.HEADER,
      HelpInlineKeyboard(),
    );
  });
}

export function registerMessage(bot: Bot<MyContext>): void {
  bot.on(
    "message:text",
    blacklistMiddleware,
    authMiddleware,
    checkInitMiddleware,
    async (ctx) => {
      if (ctx.message.text === BUTTONS_KEYBOARD.SurveyButton) {
        await ctx.conversation.enter(ScenesUser.SurveyScene);
      } else if (ctx.message.text === BUTTONS_KEYBOARD.InviteButton) {
        await ctx.conversation.enter(ScenesUser.InviteScene);
      } else if (ctx.message.text === BUTTONS_KEYBOARD.BalanceButton) {
        await handleMessageBalance(ctx, "user");
      }
    },
  );
}
