import { MESSAGES } from "../constants/messages";
import {MyContext, MyConversationContext} from "../types/type";

export const getUserAccount = async (ctx: MyContext | MyConversationContext): Promise<string | null> => {
  const userAccount = await returnUserAccount(ctx);
  if (!userAccount) {
    await ctx.reply(MESSAGES.USER_ACCOUNT_UNDEFINED);
    return userAccount;
  }
  return userAccount;
};

export const returnUserAccount = async (ctx: MyContext | MyConversationContext): Promise<string | null> => {
  return ctx?.from?.username ?? null;
};
