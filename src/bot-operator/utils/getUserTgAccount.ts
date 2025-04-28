import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext, MyConversationContext} from "../../bot-common/types/type";

export const getUserAccount = async (ctx: MyContext | MyConversationContext): Promise<string | null> => {
  const userAccount = await returnUserAccount(ctx);
  if (!userAccount) {
    await ctx.reply(RESPONSES.USER_ACCOUNT_UNDEFINED);
    return userAccount;
  }
  return userAccount;
};

export const returnUserAccount = async (ctx: MyContext | MyConversationContext): Promise<string | null> => {
  return ctx?.from?.username ?? null;
};
