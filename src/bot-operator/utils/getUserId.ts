import { MESSAGES } from "../constants/messages";
import {MyContext, MyConversationContext} from "../types/type";

export const getUserId = async (ctx: MyContext | MyConversationContext): Promise<number | null> => {
  const userId = await returnUserId(ctx);
  if (!userId) {
    await ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    return userId;
  }
  return userId;
};

export const returnUserId = async (ctx: MyContext | MyConversationContext): Promise<number | null> => {
  return ctx?.from?.id ?? null;
};
