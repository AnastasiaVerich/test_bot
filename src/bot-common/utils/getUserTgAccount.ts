import { MyContext, MyConversationContext } from "../types/type";
import { RESPONSES } from "../constants/responses";

export const getUserAccount = async (
  ctx: MyContext | MyConversationContext,
  skip: boolean = false,
): Promise<string | null> => {
  const userAccount = await returnUserAccount(ctx);
  if (!userAccount) {
    if (skip) {
      return userAccount;
    }
    await ctx.reply(RESPONSES.USER_ACCOUNT_UNDEFINED);
    return userAccount;
  }
  return userAccount;
};
export const returnUserAccount = async (
  ctx: MyContext | MyConversationContext,
): Promise<string | null> => {
  return ctx?.from?.username ?? null;
};
