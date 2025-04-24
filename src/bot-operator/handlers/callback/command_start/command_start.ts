import {Message} from "grammy/types";
import {findUserByTelegramId} from "../../../../database/queries/userQueries";
import {addReferral} from "../../../../database/queries/referralQueries";
import {MyContext} from "../../../types/type";
import {getUserId, returnUserId} from "../../../utils/getUserId";
import logger from "../../../../lib/logger";
import {COMMAND_START} from "./text";
import {findAllowedOperator} from "../../../../database/queries/operatorQueries";
import {getUserAccount} from "../../../utils/getUserTgAccount";

export const handleStartCommand = async (
  ctx: MyContext,
): Promise<Message.TextMessage | void> => {
  // try {
  //
  //   // Получаем ID текущего пользователя Telegram
  //   const userAccount = await getUserAccount(ctx);
  //   if (!userAccount) return;
  //
  //   // Проверяем, существует ли пользователь в базе данных
  //   const allowed = await findAllowedOperator(userAccount);
  //
  //   if (allowed) {
  //     return ctx.reply(COMMAND_START.WELCOME_OPERATOR, {
  //       reply_markup: IdentificationKeyboard(),
  //     });
  //   } else {
  //     if (referral) {
  //       // Сохраняем реферальный код, если еще нет записи по текущему юзеру
  //       await addReferral(userId, Number(referral));
  //     }
  //
  //     return ctx.reply(COMMAND_START.WELCOME_MENU_USER, {
  //       parse_mode: "HTML", // Указываем, что текст содержит HTML
  //       reply_markup: RegistrationKeyboard(),
  //     });
  //   }
  // } catch (error) {
  //   const userId = await returnUserId(ctx);
  //
  //   let shortError = "";
  //   if (error instanceof Error) {
  //     shortError = error.message.substring(0, 50);
  //   } else {
  //     shortError = String(error).substring(0, 50);
  //   }
  //   logger.error(userId + ": Error in command /start: " + shortError);
  //   return ctx.reply(COMMAND_START.SOME_ERROR, {
  //     reply_markup: { remove_keyboard: true },
  //   });
  // }
};
