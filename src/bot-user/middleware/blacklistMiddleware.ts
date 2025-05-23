import { MiddlewareFn } from "grammy";
import { getUserId } from "../../bot-common/utils/getUserId";
import logger from "../../lib/logger";
import { userInBlacklist } from "../utils/userInBlacklist";
import { RESPONSES } from "../../bot-common/constants/responses";
import { MyContext } from "../../bot-common/types/type";

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
    logger.error("Error blacklistMiddleware: " + error);
    await ctx.reply(RESPONSES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
};
