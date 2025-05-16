import { MiddlewareFn } from "grammy";
import logger from "../../lib/logger";
import { findUser } from "../utils/findUser";
import { RESPONSES } from "../../bot-common/constants/responses";
import { MyContext } from "../../bot-common/types/type";
import { getUserId } from "../../bot-common/utils/getUserId";

export const authMiddleware: MiddlewareFn<MyContext> = async (ctx, next) => {
  try {
    const userId = await getUserId(ctx);

    if (!userId) return;

    const user = await findUser(userId, ctx);
    if (!user) return;

    // Если пользователь авторизован, передаем управление следующему middleware
    return next();
  } catch (error) {
    logger.error("Error authMiddleware: " + error);
    await ctx.reply(RESPONSES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
