import { Message } from "grammy/types";
import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import {
  AuthUserKeyboard,
  ConfirmCancelButtons,
  EmptyKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { BalanceMenu } from "../../bot-common/keyboards/inlineKeyboard";
import { WITHDRAWAL_USER_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getCommonVariableByLabel } from "../../database/queries_kysely/common_variables";
import {
  addPendingPayment,
  getAllPendingPaymentByUserId,
} from "../../database/queries_kysely/pending_payments";
import {
  getUserBalance,
  updateUserByUserId,
} from "../../database/queries_kysely/users";
import { addUserLogs } from "../../database/queries_kysely/bot_user_logs";

export async function withdrawalScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
  try {
    const userId = await conversation.external(() => getUserId(ctx));
    if (!userId) return;

    await conversation.external(() => {
      const data = "";
      return addUserLogs({
        user_id: userId,
        event_type: "withdrawal_start",
        event_data: JSON.stringify(data),
      });
    });

    let curseInfo = await getCommonVariableByLabel("ton_rub_price");
    if (!curseInfo) {
      await conversation.external(() => {
        const data = { result: "curseInfo is null" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    const curseTon = Number(curseInfo.value);

    // Проверка на наличие ожидающего платежа
    const pendingPayment = await conversation.external(() =>
      getAllPendingPaymentByUserId(userId),
    );

    if (pendingPayment.length > 0) {
      await conversation.external(() => {
        const data = { result: "has pending payment" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.HAS_PENDING_PAYMENT);
    }

    // Проверка баланса пользователя
    const balance = await conversation.external(() => getUserBalance(userId));

    if (!balance) {
      await conversation.external(() => {
        const data = { result: "balance is null" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });
      return ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    const userTonBalance = Number((balance / curseTon).toFixed(2));

    if (Number(userTonBalance) === 0) {
      await conversation.external(() => {
        const data = { result: "balance in TON is 0" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.INVALID_BALANCE);
    }

    await conversation.external(() => {
      const data = {
        balanceRub: balance,
        balanceTON: userTonBalance,
      };
      return addUserLogs({
        user_id: userId,
        event_type: "withdrawal_check_balance",
        event_data: JSON.stringify(data),
      });
    });

    // Шаг 1: Ожидаем ввода суммы для вывода
    const amountTON = await stepAmount(conversation, ctx, userTonBalance);
    await conversation.external(() => {
      const data = { result: amountTON };
      return addUserLogs({
        user_id: userId,
        event_type: "withdrawal_amount",
        event_data: JSON.stringify(data),
      });
    });
    if (!amountTON) {
      await conversation.external(() => {
        const data = { result: "amount is null" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    // Шаг 2: Ожидаем ввода адреса для перевода
    const recipientAddress = await stepWallet(conversation, ctx);
    await conversation.external(() => {
      const data = { result: recipientAddress };
      return addUserLogs({
        user_id: userId,
        event_type: "withdrawal_wallet",
        event_data: JSON.stringify(data),
      });
    });

    if (!recipientAddress) {
      await conversation.external(() => {
        const data = { result: "failed enter wallet" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    // Шаг 3: Подтверждение вывода средств
    const resultConfirm = await stepConfirm(
      conversation,
      ctx,
      recipientAddress,
      amountTON,
    );

    if (!resultConfirm) {
      await conversation.external(() => {
        const data = { result: "failed confirm" };
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_failed",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих
      await addPendingPayment({
        userId: userId,
        amount: amountTON,
        address: recipientAddress,
      });
      const amountRub =
        amountTON * curseTon > balance ? balance : amountTON * curseTon;
      await updateUserByUserId(userId, {
        add_balance: -amountRub,
      });
      await conversation.external(() => {
        const data = {};
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_success",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.SUCCESS, {
        reply_markup: AuthUserKeyboard(),
      });
    } else {
      await conversation.external(() => {
        const data = {};
        return addUserLogs({
          user_id: userId,
          event_type: "withdrawal_cancel",
          event_data: JSON.stringify(data),
        });
      });

      return ctx.reply(WITHDRAWAL_USER_SCENE.CANCELLED, {
        reply_markup: AuthUserKeyboard(),
      });
    }
  } catch (error) {
    const userId = await conversation.external(() => getUserId(ctx));
    await conversation.external(() => {
      const data = { result: "error" };
      return addUserLogs({
        user_id: userId ?? 0,
        event_type: "withdrawal_cancel",
        event_data: JSON.stringify(data),
      });
    });

    logger.error("Error in withdrawalScene: " + error);
    await ctx.reply(WITHDRAWAL_USER_SCENE.SOME_ERROR, {
      reply_markup: BalanceMenu(),
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
    await ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_AMOUNT, {
      parse_mode: "HTML",
      reply_markup: { remove_keyboard: true },
    });

    let result: number | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_USER_SCENE.ENTERED_AMOUNT_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true },
          }),
      });

      if (!response.message?.text) break;

      const amountText = response.message?.text;
      const amountTON = parseFloat(amountText ?? "0");

      if (isNaN(amountTON) || amountTON < 0.05 || amountTON > userTonBalance) {
        await ctx.reply(
          WITHDRAWAL_USER_SCENE.INVALID_AMOUNT.replace(
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

    await ctx.reply(`${WITHDRAWAL_USER_SCENE.ENTERED_AMOUNT} ${result} TON`, {
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
    await ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_WALLET, {
      parse_mode: "HTML",
      reply_markup: EmptyKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_USER_SCENE.ENTER_WALLET_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: EmptyKeyboard(),
          }),
      });

      if (!response.message?.text) break;

      const wallet = response.message?.text.trim();

      if (wallet?.length === 0) {
        await ctx.reply(WITHDRAWAL_USER_SCENE.ENTERED_INVALID_WALLET, {
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
  recipientAddress: string,
  amountTON: number,
) {
  try {
    await ctx.reply(
      WITHDRAWAL_USER_SCENE.CONFIRMATION.replace(
        "{amount}",
        amountTON.toString(),
      ).replace("{address}", recipientAddress),
      {
        parse_mode: "HTML",
        reply_markup: ConfirmCancelButtons(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(WITHDRAWAL_USER_SCENE.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelButtons(),
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
