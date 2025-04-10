import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { Message } from "grammy/types";
import { MyContext } from "../../types/type";
import { MESSAGES } from "../../constants/messages";
import { WITHDRAWAL_SCENE } from "../../constants/scenes";
import { EmptyKeyboard } from "../../keyboards/EmptyKeyboard";
import { AuthUserKeyboard } from "../../keyboards/AuthUserKeyboard";
import { BUTTONS_KEYBOARD } from "../../constants/button";
import {
  addPendingPayment,
  findPendingPaymentByUserId,
} from "../../../database/queries/pendingPaymentsQueries";
import logger from "../../../lib/logger";
import { getUserId } from "../../utils/getUserId";
import {checkBalance, updateMinusUserBalance} from "../../../database/queries/userQueries";

export async function withdrawalScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<Message.TextMessage | void> {
  try {
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Проверка на наличие ожидающего платежа
    const pendingPayment = await findPendingPaymentByUserId(userId);
    if (pendingPayment.length > 0) {
      return ctx.reply(WITHDRAWAL_SCENE.HAS_PENDING_PAYMENT);
    }

    // Проверка баланса пользователя
    const balance = await checkBalance(userId);

    if (!balance) {
      return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }



    const userBalance = Number((balance / 250).toFixed(2))
    if (Number(userBalance) === 0) {
      return ctx.reply(WITHDRAWAL_SCENE.INVALID_BALANCE);
    }

    // Шаг 1: Ожидаем ввода суммы для вывода
    await ctx.reply(WITHDRAWAL_SCENE.INPUT_AMOUNT, {
      parse_mode: "HTML",
      reply_markup: EmptyKeyboard(),
    });

    const amountMessage = await conversation.waitFor("message:text");
    const amountText = amountMessage.message?.text;
    const amountTON = parseFloat(amountText ?? "0");

    // Проверка валидности суммы
    if (isNaN(amountTON) || amountTON <= 0 || amountTON > userBalance) {
      return ctx.reply(
        WITHDRAWAL_SCENE.INVALID_AMOUNT.replace(
          "{balance}",
          userBalance.toString(),
        ),
        { reply_markup: AuthUserKeyboard() },
      );
    }

    // Шаг 2: Ожидаем ввода адреса для перевода
    await ctx.reply(WITHDRAWAL_SCENE.INPUT_ADDRESS, {
      parse_mode: "HTML",
      reply_markup: EmptyKeyboard(),
    });

    const addressMessage = await conversation.waitFor("message:text");
    const recipientAddress = addressMessage.message?.text;

    // Проверка адреса получателя
    if (!recipientAddress || recipientAddress.trim().length === 0) {
      return ctx.reply(WITHDRAWAL_SCENE.INVALID_ADDRESS);
    }

    // Подтверждение вывода средств
    await ctx.reply(
      WITHDRAWAL_SCENE.CONFIRMATION.replace(
        "{amount}",
        amountTON.toString(),
      ).replace("{address}", recipientAddress),
      {
        parse_mode: "HTML",
        reply_markup: new Keyboard()
          .text(BUTTONS_KEYBOARD.ConfirmButton)
          .text(BUTTONS_KEYBOARD.CancelButton)
          .resized()
          .oneTime(),
      },
    );

    const confirmationMessage = await conversation.waitFor("message:text");
    const confirmation = confirmationMessage.message?.text;

    if (confirmation === BUTTONS_KEYBOARD.ConfirmButton) {
      // Добавляем платеж в список ожидающих
      await addPendingPayment(userId, amountTON, recipientAddress);
      await updateMinusUserBalance(userId,amountTON *250);

      logger.info(
        `Пользователь ${userId} инициировал вывод ${amountTON} TON на адрес ${recipientAddress}`,
      );
      return ctx.reply(WITHDRAWAL_SCENE.SUCCESS, {
        reply_markup: AuthUserKeyboard(),
      });
    } else {
      logger.info(`Пользователь ${userId} отменил снятие средств.`);
      return ctx.reply(WITHDRAWAL_SCENE.CANCELLED, {
        reply_markup: AuthUserKeyboard(),
      });
    }
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error in withdrawalScene: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR);
  }
}
