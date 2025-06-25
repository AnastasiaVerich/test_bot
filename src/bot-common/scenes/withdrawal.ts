import { Message } from "grammy/types";
import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import logger from "../../lib/logger";

import { getCommonVariableByLabel } from "../../database/queries_kysely/common_variables";
import { addUserLogs } from "../../database/queries_kysely/bot_user_logs";
import {
  confirmWithdrawalMoney,
  getBalanceF,
  hasPendingPayment,
} from "../../database/services/moneyService";
import {
  entitiesType,
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../types/type";
import { getUserId } from "../utils/getUserId";
import { WITHDRAWAL_SCENE } from "../constants/scenes";
import { BalanceMenuInlineKeyboard } from "../keyboards/inlineKeyboard";
import { BUTTONS_KEYBOARD } from "../constants/buttons";
import { ConfirmCancelKeyboard, EmptyKeyboard } from "../keyboards/keyboard";

export async function withdrawalScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
  type: entitiesType,
  AuthKeyboard: Keyboard,
  addLogs?: typeof addUserLogs,
): Promise<Message.TextMessage | void> {
  try {
    console.log(123);
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;
    if (addLogs) {
      await conversation.external(() =>
        addLogs({
          user_id: userId,
          event_type: "withdrawal",
          step: "start",
        }),
      );
    }

    let curseInfo = await getCommonVariableByLabel("ton_rub_price");
    if (!curseInfo) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("curseInfo is null"),
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }

    const curseTon = Number(curseInfo.value);

    // Проверка на наличие ожидающего платежа
    const userHasPendingPayment = await conversation.external(() =>
      hasPendingPayment(userId, type),
    );

    if (userHasPendingPayment) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("has pendingPayment"),
          }),
        );
      }
      return ctx.reply(WITHDRAWAL_SCENE.HAS_PENDING_PAYMENT);
    }

    // Проверка баланса пользователя
    const balance = await conversation.external(() =>
      getBalanceF(userId, type),
    );

    if (!balance) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("balance not defined"),
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }

    const userTonBalance = Number((balance / curseTon).toFixed(2));

    if (Number(userTonBalance) === 0) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("userTonBalance === 0"),
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.INVALID_BALANCE);
    }

    if (addLogs) {
      await conversation.external(() =>
        addLogs({
          user_id: userId,
          event_type: "withdrawal",
          step: "check_balance",
          event_data: JSON.stringify({
            balanceRub: balance,
            balanceTON: userTonBalance,
          }),
        }),
      );
    }

    // Шаг 1: Ожидаем ввода суммы для вывода
    const amountTON = await stepAmount(conversation, ctx, userTonBalance);
    if (addLogs) {
      await conversation.external(() =>
        addLogs({
          user_id: userId,
          event_type: "withdrawal",
          step: "amount",
          event_data: JSON.stringify(amountTON),
        }),
      );
    }

    if (!amountTON) {
      if (addLogs) {
        await conversation.external(() =>
          addUserLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("amountTON is null"),
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }

    // Шаг 2: Ожидаем ввода адреса для перевода
    const recipientWallet = await stepWallet(conversation, ctx);
    if (addLogs) {
      await conversation.external(() =>
        addLogs({
          user_id: userId,
          event_type: "withdrawal",
          step: "wallet",
          event_data: JSON.stringify(recipientWallet),
        }),
      );
    }

    if (!recipientWallet) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("recipientWallet is null"),
          }),
        );
      }
      return ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }

    // Шаг 3: Подтверждение вывода средств
    const resultConfirm = await stepConfirm(
      conversation,
      ctx,
      recipientWallet,
      amountTON,
    );

    if (!resultConfirm) {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "failed",
            event_data: JSON.stringify("save in db is failed"),
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      const amountRub =
        amountTON * curseTon > balance ? balance : amountTON * curseTon;
      await confirmWithdrawalMoney({
        type,
        userId: userId,
        amountTON: amountTON,
        amountRub: amountRub,
        wallet: recipientWallet,
      });

      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "success",
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.SUCCESS, {
        reply_markup: AuthKeyboard,
      });
    } else {
      if (addLogs) {
        await conversation.external(() =>
          addLogs({
            user_id: userId,
            event_type: "withdrawal",
            step: "cancel",
          }),
        );
      }

      return ctx.reply(WITHDRAWAL_SCENE.CANCELLED, {
        reply_markup: AuthKeyboard,
      });
    }
  } catch (error) {
    const userId = await conversation.external(() => getUserId(ctx));
    if (addLogs) {
      await conversation.external(() => {
        return addLogs({
          user_id: userId ?? 0,
          event_type: "withdrawal",
          step: "failed",
          event_data: JSON.stringify("some error"),
        });
      });
    }

    logger.error("Error in withdrawalScene: " + error);
    await ctx.reply(WITHDRAWAL_SCENE.SOME_ERROR, {
      reply_markup: BalanceMenuInlineKeyboard(),
    });
    return;
  }
}

async function stepAmount(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
  userTonBalance: number,
) {
  try {
    await ctx.reply(WITHDRAWAL_SCENE.ENTER_AMOUNT, {
      parse_mode: "HTML",
      reply_markup: { remove_keyboard: true },
    });

    let result: number | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_SCENE.ENTERED_AMOUNT_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true },
          }),
      });

      if (!response.message?.text) break;

      const amountText = response.message?.text;
      const amountTON = parseFloat(amountText ?? "0");

      if (isNaN(amountTON) || amountTON < 0.05 || amountTON > userTonBalance) {
        await ctx.reply(
          WITHDRAWAL_SCENE.INVALID_AMOUNT.replace(
            "{balance}",
            userTonBalance.toString(),
          ),
          {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true },
          },
        );
        continue;
      }
      result = amountTON;
      break;
    }

    if (!result) return null;

    await ctx.reply(`${WITHDRAWAL_SCENE.ENTERED_AMOUNT} ${result} TON`, {
      reply_markup: { remove_keyboard: true },
    });

    return result;
  } catch (error) {
    logger.error("Error in withdrawalScene stepAmount: " + error);
    return null;
  }
}

async function stepWallet(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(WITHDRAWAL_SCENE.ENTER_WALLET, {
      parse_mode: "HTML",
      reply_markup: EmptyKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_SCENE.ENTER_WALLET_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: EmptyKeyboard(),
          }),
      });

      if (!response.message?.text) break;

      const wallet = response.message?.text.trim();

      if (wallet?.length < 10) {
        await ctx.reply(WITHDRAWAL_SCENE.ENTERED_INVALID_WALLET, {
          parse_mode: "HTML",
          reply_markup: EmptyKeyboard(),
        });
        continue;
      }
      result = wallet;
      break;
    }

    if (!result) return null;

    return result;
  } catch (error) {
    logger.error("Error in withdrawalScene stepWallet: " + error);
    return null;
  }
}

async function stepConfirm(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
  recipientWallet: string,
  amountTON: number,
) {
  try {
    await ctx.reply(
      WITHDRAWAL_SCENE.CONFIRMATION.replace(
        "{amount}",
        amountTON.toString(),
      ).replace("{address}", recipientWallet),
      {
        parse_mode: "HTML",
        reply_markup: ConfirmCancelKeyboard(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(WITHDRAWAL_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelKeyboard(),
            }),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    return result;
  } catch (error) {
    logger.error("Error in withdrawalScene stepConfirm: " + error);
    return null;
  }
}
