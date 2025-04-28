import { findUserByTelegramId, User } from "../../database/queries/userQueries";
import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext, MyConversationContext} from "../../bot-common/types/type";

export const findUser = async (
  userId: number,
  ctx: MyContext | MyConversationContext,
): Promise<User | undefined> => {
  const user = await findUserByTelegramId(userId);

  if (!user) {
    await ctx.reply(RESPONSES.YOU_NOT_AUTH, {
      reply_markup: { remove_keyboard: true },
    });
  }
  return user;
};
