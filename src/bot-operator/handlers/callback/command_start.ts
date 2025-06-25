import { Message } from "grammy/types";
import { COMMAND_OPERATOR_START } from "../../../bot-common/constants/handler_command";
import { RegistrationInlineKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { getUserAccount } from "../../../bot-common/utils/getUserTgAccount";
import { AuthOperatorKeyboard } from "../../../bot-common/keyboards/keyboard";
import { getOperatorByIdPhoneOrTg } from "../../../database/queries_kysely/operators";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  try {
    // Получаем ID текущего пользователя Telegram
    const userAccount = await getUserAccount(ctx);
    if (!userAccount) return;

    // Проверяем, существует ли пользователь в базе данных в списке разрешенных операторов
    const operator = await getOperatorByIdPhoneOrTg({
      tg_account: userAccount,
    });
    if (!operator) {
      return ctx.reply(COMMAND_OPERATOR_START.WELCOME_UNDEFINED, {
        reply_markup: { remove_keyboard: true },
      });
    }

    if (!operator.phone) {
      return ctx.reply(COMMAND_OPERATOR_START.WELCOME_NEW_OPERATOR, {
        parse_mode: "HTML",
        reply_markup: RegistrationInlineKeyboard(),
      });
    }
    return ctx.reply(COMMAND_OPERATOR_START.WELCOME_OLD_OPERATOR, {
      reply_markup: AuthOperatorKeyboard(),
    });
  } catch (error) {
    logger.info(error);
    return ctx.reply(COMMAND_OPERATOR_START.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
