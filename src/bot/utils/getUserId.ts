import { MESSAGES } from "../constants/messages";
import { MyContext } from "../types/type";

export const getUserId = async (ctx: MyContext): Promise<number | null> => {
  const userId = ctx?.from?.id ?? undefined;
  if (!userId) {
    await ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    return null;
  }
  return userId;
};
