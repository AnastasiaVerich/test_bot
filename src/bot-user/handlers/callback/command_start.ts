import { InlineKeyboard } from "grammy";
import { Message } from "grammy/types";
import { findUserByTelegramId } from "../../../database/queries/userQueries";
import { addReferral } from "../../../database/queries/referralQueries";
import { MyContext } from "../../types/type";
import { MESSAGES } from "../../constants/messages";
import { BUTTONS_CALLBACK_QUERIES } from "../../constants/button";
import { getUserId, returnUserId } from "../../utils/getUserId";
import logger from "../../../lib/logger";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Извлекаем реферальный код, если пользователь перешёл по реферальной ссылке.
    const referral = ctx?.match ?? null;

    // Получаем ID текущего пользователя Telegram, вызвавшего команду `/start`.
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Проверяем, существует ли пользователь в базе данных
    const user = await findUserByTelegramId(userId);

    if (user) {
      return ctx.reply(MESSAGES.WELCOME_OLD_USER, {
        reply_markup: new InlineKeyboard().text(
          BUTTONS_CALLBACK_QUERIES.IdentificationButtonText,
          BUTTONS_CALLBACK_QUERIES.IdentificationButton,
        ),
      });
    } else {
      if (referral) {
        // Сохраняем реферальный код, если еще нет записи по текущему юзеру
        await addReferral(userId, Number(referral));
      }

      return ctx.reply(MESSAGES.WELCOME_MENU_USER, {
        parse_mode: "HTML", // Указываем, что текст содержит HTML
        reply_markup: new InlineKeyboard().text(
          BUTTONS_CALLBACK_QUERIES.RegistrationButtonText,
          BUTTONS_CALLBACK_QUERIES.RegistrationButton,
        ),
      });
    }
  } catch (error) {
    const userId = await returnUserId(ctx);

    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error(userId + ": Error in command /start: " + shortError);
    return ctx.reply(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
