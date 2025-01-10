import { MiddlewareFn } from "grammy";
import { findUserByTelegramId } from "../../database/queries/userQueries";
import { MESSAGES } from "../constants/messages";
import { MyContext } from "../types/type";
import { getUserId } from "../utils/getUserId";
import logger from "../../lib/logger";

export const authMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
  try {
    const userId = await getUserId(ctx);

    if (!userId) return;

    // Проверка пользователя в базе данных
    const user = await findUserByTelegramId(userId);

    if (!user) {
      await ctx.reply(MESSAGES.YOU_NOT_AUTH);
      return;
    }

    // Если пользователь авторизован, передаем управление следующему middleware
    return next();
  } catch (error) {
    logger.error("Error authMiddleware:", error);
    await ctx.reply(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
