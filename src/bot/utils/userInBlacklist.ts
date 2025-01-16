import { MESSAGES } from "../constants/messages";
import { MyContext } from "../types/type";
import { checkExistInBlockUser } from "../../database/queries/blacklistUsersQueries";

export const userInBlacklist = async (
  accountId: number | null,
  phoneNumber: string | null,
  ctx: MyContext,
): Promise<boolean> => {
  const blackList = await checkExistInBlockUser(accountId, phoneNumber);

  if (blackList) {
    await ctx.reply(MESSAGES.YOU_IN_BLACKLIST, {
      reply_markup: { remove_keyboard: true },
    });
    return true;
  }
  return false;
};
