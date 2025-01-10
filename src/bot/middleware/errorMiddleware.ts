import { MiddlewareFn } from "grammy";
import logger from "../../lib/logger";

export const errorMiddleware: MiddlewareFn = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    logger.error("Произошла ошибка:", error);

    // Уведомление пользователя об ошибке
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
};
