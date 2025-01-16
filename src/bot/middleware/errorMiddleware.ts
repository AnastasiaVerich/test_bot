import { MiddlewareFn } from "grammy";
import logger from "../../lib/logger";

export const errorMiddleware: MiddlewareFn = async (ctx, next) => {
  try {
    await next();
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Произошла ошибка: " + shortError);

    // Уведомление пользователя об ошибке
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
};
