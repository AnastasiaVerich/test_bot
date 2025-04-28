import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext, MyConversationContext} from "../../bot-common/types/type";

export const getUserId = async (ctx: MyContext | MyConversationContext): Promise<number | null> => {
  const userId = await returnUserId(ctx);
  if (!userId) {
    await ctx.reply(RESPONSES.USER_ID_UNDEFINED);
    return userId;
  }
  return userId;
};

export const returnUserId = async (ctx: MyContext | MyConversationContext): Promise<number | null> => {
  return ctx?.from?.id ?? null;
};
