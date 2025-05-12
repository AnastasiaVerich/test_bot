import {Message} from "grammy/types";
import {findUserByTelegramId} from "../../../database/queries/userQueries";
import {addReferral} from "../../../database/queries/referralQueries";
import logger from "../../../lib/logger";
import {COMMAND_USER_START} from "../../../bot-common/constants/handler_command";
import {IdentificationKeyboard, RegistrationKeyboard} from "../../../bot-common/keyboards/inlineKeyboard";
import {MyContext} from "../../../bot-common/types/type";
import {getUserId, returnUserId} from "../../../bot-common/utils/getUserId";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Извлекаем реферальный код, если пользователь перешёл по реферальной ссылке.
    const referral = ctx?.match ?? null;

    // Получаем ID текущего пользователя Telegram
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Проверяем, существует ли пользователь в базе данных
    const user = await findUserByTelegramId(userId);

    if (user) {
      return ctx.reply(COMMAND_USER_START.WELCOME_OLD_USER, {
        reply_markup: IdentificationKeyboard(),
      });
    } else {
      if (referral) {
        // Сохраняем реферальный код, если еще нет записи по текущему юзеру
        await addReferral(userId, Number(referral));
      }

      return ctx.reply(COMMAND_USER_START.WELCOME_MENU_USER, {
        parse_mode: "HTML", // Указываем, что текст содержит HTML
        reply_markup: RegistrationKeyboard(),
      });
    }
  } catch (error) {
    const userId = await returnUserId(ctx);

    logger.error(userId + ": Error in command /start: " + error);
    return ctx.reply(COMMAND_USER_START.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
