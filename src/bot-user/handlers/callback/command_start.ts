import { Message } from "grammy/types";
import logger from "../../../lib/logger";
import { COMMAND_USER_START } from "../../../bot-common/constants/handler_command";
import {
  IdentificationKeyboard,
  RegistrationKeyboard,
} from "../../../bot-common/keyboards/inlineKeyboard";
import { MyContext } from "../../../bot-common/types/type";
import { getUserId, returnUserId } from "../../../bot-common/utils/getUserId";
import { addReferral } from "../../../database/queries_kysely/referral_bonuses";
import { getUser } from "../../../database/queries_kysely/users";
import {
  addUserLogs,
  addUserLogsUnique,
} from "../../../database/queries_kysely/bot_user_logs";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Извлекаем реферальный код, если пользователь перешёл по реферальной ссылке.
    const match = ctx?.match ?? "";

    let isReferral = false;

    if (match.length > 0) {
      isReferral = !match?.toString().startsWith("campaign__");
    }

    // Получаем ID текущего пользователя Telegram
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Проверяем, существует ли пользователь в базе данных
    const user = await getUser({ user_id: userId });

    if (user) {
      await addUserLogs({
        user_id: userId,
        event_type: "restart",
      });

      return ctx.reply(COMMAND_USER_START.WELCOME_OLD_USER, {
        reply_markup: IdentificationKeyboard(),
      });
    } else {
      if (isReferral) {
        // Сохраняем реферальный код, если еще нет записи по текущему юзеру
        await addReferral({
          userId: userId,
          referredId: Number(match),
        });
      }
      await addUserLogsUnique({
        user_id: userId,
        event_type: "start",
        event_data: JSON.stringify({ referral_start: match }),
      });

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
