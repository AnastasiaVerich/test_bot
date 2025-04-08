import { MiddlewareFn } from "grammy";
import { MESSAGES } from "../constants/messages";
import { MyContext } from "../types/type";
import { getUserId } from "../utils/getUserId";
import logger from "../../lib/logger";
import { userInBlacklist } from "../utils/userInBlacklist";

export const blacklistMiddleware: MiddlewareFn<MyContext> = async (
  ctx,
  next,
) => {
  try {
    const userId = await getUserId(ctx);

    if (!userId) return;

    const isBlockUser = await userInBlacklist(userId, null, ctx);
    if (isBlockUser) return;

    // Если пользователь не заблокирован, передаем управление следующему middleware
    return next();
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error blacklistMiddleware: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
