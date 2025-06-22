import { Message } from "grammy/types";
import { COMMAND_AUDITOR_START } from "../../../bot-common/constants/handler_command";
import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { AuthAuditorKeyboard } from "../../../bot-common/keyboards/keyboard";
import { getUserAccount } from "../../../bot-common/utils/getUserTgAccount";
import { getAuditorByIdPhoneOrTg } from "../../../database/queries_kysely/auditors";
import { RegistrationKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Получаем ID текущего пользователя Telegram
    const userAccount = await getUserAccount(ctx);
    if (!userAccount) return;

    // Проверяем, существует ли пользователь в базе данных в списке разрешенных аудиторов
    const auditor = await getAuditorByIdPhoneOrTg({
      tg_account: userAccount,
    });

    if (!auditor) {
      return ctx.reply(COMMAND_AUDITOR_START.WELCOME_UNDEFINED, {
        reply_markup: { remove_keyboard: true },
      });
    }

    if (!auditor.phone) {
      return ctx.reply(COMMAND_AUDITOR_START.WELCOME_NEW_AUDITOR, {
        parse_mode: "HTML",
        reply_markup: RegistrationKeyboard(),
      });
    }
    return ctx.reply(COMMAND_AUDITOR_START.WELCOME_OLD_AUDITOR, {
      reply_markup: AuthAuditorKeyboard(),
    });
  } catch (error) {
    logger.info(error);
    return ctx.reply(COMMAND_AUDITOR_START.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
