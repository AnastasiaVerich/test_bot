import { MESSAGES } from "../constants/messages";
import {MyContext, MyConversationContext} from "../types/type";
import { findUserByTelegramId, User } from "../../database/queries/userQueries";

export const findUser = async (
  userId: number,
  ctx: MyContext | MyConversationContext,
): Promise<User | undefined> => {
  const user = await findUserByTelegramId(userId);

  if (!user) {
    await ctx.reply(MESSAGES.YOU_NOT_AUTH, {
      reply_markup: { remove_keyboard: true },
    });
  }
  return user;
};
