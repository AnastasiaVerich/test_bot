import { Message } from "grammy/types";
import { MyContext } from "../../bot-common/types/type";
import { getUserAccount } from "../../bot-common/utils/getUserTgAccount";
import { getSupervisorByIdPhoneOrTg } from "../../database/queries_kysely/supervisor";
import { COMMAND_SUPERVISOR_START } from "../../bot-common/constants/handler_command";
import { RegistrationKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import logger from "../../lib/logger";
import { SupervisorSettingKeyboard } from "../../bot-common/keyboards/keyboard";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Получаем ID текущего пользователя Telegram
    const userAccount = await getUserAccount(ctx);
    if (!userAccount) return;

    // Проверяем, существует ли пользователь в базе данных в списке разрешенных операторов
    const supervisor = await getSupervisorByIdPhoneOrTg({
      tg_account: userAccount,
    });
    if (!supervisor) {
      return ctx.reply(COMMAND_SUPERVISOR_START.WELCOME_UNDEFINED, {
        reply_markup: { remove_keyboard: true },
      });
    }

    if (!supervisor.phone) {
      return ctx.reply(COMMAND_SUPERVISOR_START.WELCOME_NEW_SUPERVISOR, {
        parse_mode: "HTML",
        reply_markup: RegistrationKeyboard(),
      });
    }
    return ctx.reply(COMMAND_SUPERVISOR_START.WELCOME_OLD_SUPERVISOR, {
      reply_markup: SupervisorSettingKeyboard(),
    });
  } catch (error) {
    logger.info(error);
    return ctx.reply(COMMAND_SUPERVISOR_START.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
