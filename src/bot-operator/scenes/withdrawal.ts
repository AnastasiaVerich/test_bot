import { Message } from "grammy/types";
import { Conversation } from "@grammyjs/conversations";
import logger from "../../lib/logger";
import { getUserId } from "../../bot-common/utils/getUserId";
import { BUTTONS_KEYBOARD } from "../../bot-common/constants/buttons";
import {
  AuthOperatorKeyboard,
  ConfirmCancelButtons,
  EmptyKeyboard,
} from "../../bot-common/keyboards/keyboard";
import { BalanceMenu } from "../../bot-common/keyboards/inlineKeyboard";
import { WITHDRAWAL_OPERATOR_SCENE } from "../../bot-common/constants/scenes";
import {
  MyContext,
  MyConversation,
  MyConversationContext,
} from "../../bot-common/types/type";
import { getCommonVariableByLabel } from "../../database/queries_kysely/common_variables";
import {
  addPendingPayment,
  getAllPendingPaymentByOperatorId,
} from "../../database/queries_kysely/pending_payments";
import {
  getOperatorBalance,
  updateOperatorByOperatorId,
} from "../../database/queries_kysely/operators";

export async function withdrawalScene(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<Message.TextMessage | void> {
  try {
    const operatorId = await conversation.external(() => getUserId(ctx));
    if (!operatorId) return;

    let curseInfo = await getCommonVariableByLabel("ton_rub_price");
    if (!curseInfo) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    const curseTon = Number(curseInfo.value);

    // Проверка на наличие ожидающего платежа
    const pendingPayment = await conversation.external(() =>
      getAllPendingPaymentByOperatorId(operatorId),
    );

    if (pendingPayment.length > 0) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.HAS_PENDING_PAYMENT);
    }

    // Проверка баланса пользователя
    const balance = await conversation.external(() =>
      getOperatorBalance(operatorId),
    );

    if (!balance) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    const userTonBalance = Number((balance / curseTon).toFixed(2));

    if (Number(userTonBalance) === 0) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.INVALID_BALANCE);
    }

    // Шаг 1: Ожидаем ввода суммы для вывода
    const amountTON = await stepAmount(conversation, ctx, userTonBalance);

    if (!amountTON) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    // Шаг 2: Ожидаем ввода адреса для перевода
    const recipientWallet = await stepWallet(conversation, ctx);

    if (!recipientWallet) {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
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
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
        reply_markup: BalanceMenu(),
      });
    }

    if (resultConfirm === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих
      await addPendingPayment({
        operatorId: operatorId,
        amount: amountTON,
        wallet: recipientWallet,
      });
      const amountRub =
        amountTON * curseTon > balance ? balance : amountTON * curseTon;
      await updateOperatorByOperatorId(operatorId, {
        add_balance: -amountRub,
      });

      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SUCCESS, {
        reply_markup: AuthOperatorKeyboard(),
      });
    } else {
      return ctx.reply(WITHDRAWAL_OPERATOR_SCENE.CANCELLED, {
        reply_markup: AuthOperatorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in withdrawalScene: " + error);
    await ctx.reply(WITHDRAWAL_OPERATOR_SCENE.SOME_ERROR, {
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
    await ctx.reply(WITHDRAWAL_OPERATOR_SCENE.ENTER_AMOUNT, {
      parse_mode: "HTML",
      reply_markup: { remove_keyboard: true },
    });

    let result: number | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_OPERATOR_SCENE.ENTERED_AMOUNT_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: { remove_keyboard: true },
          }),
      });

      if (!response.message?.text) break;

      const amountText = response.message?.text;
      const amountTON = parseFloat(amountText ?? "0");

      if (isNaN(amountTON) || amountTON < 0.05 || amountTON > userTonBalance) {
        await ctx.reply(
          WITHDRAWAL_OPERATOR_SCENE.INVALID_AMOUNT.replace(
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

    await ctx.reply(
      `${WITHDRAWAL_OPERATOR_SCENE.ENTERED_AMOUNT} ${result} TON`,
      {
        reply_markup: { remove_keyboard: true },
      },
    );

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
    await ctx.reply(WITHDRAWAL_OPERATOR_SCENE.ENTER_WALLET, {
      parse_mode: "HTML",
      reply_markup: EmptyKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(WITHDRAWAL_OPERATOR_SCENE.ENTER_WALLET_OTHERWISE, {
            parse_mode: "HTML",
            reply_markup: EmptyKeyboard(),
          }),
      });

      if (!response.message?.text) break;

      const wallet = response.message?.text.trim();

      if (wallet?.length < 10) {
        await ctx.reply(WITHDRAWAL_OPERATOR_SCENE.ENTERED_INVALID_WALLET, {
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
      WITHDRAWAL_OPERATOR_SCENE.CONFIRMATION.replace(
        "{amount}",
        amountTON.toString(),
      ).replace("{address}", recipientWallet),
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
            ctx.reply(WITHDRAWAL_OPERATOR_SCENE.CONFIRMATION_OTHERWISE, {
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
