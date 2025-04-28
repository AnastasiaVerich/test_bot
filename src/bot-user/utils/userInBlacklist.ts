import { checkExistInBlockUser } from "../../database/queries/blacklistUsersQueries";
import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext} from "../../bot-common/types/type";

export const userInBlacklist = async (
  accountId: number | null,
  phoneNumber: string | null,
  ctx: MyContext,
): Promise<boolean> => {
  const blackList = await checkExistInBlockUser(accountId, phoneNumber);

  if (blackList) {
    await ctx.reply(RESPONSES.YOU_IN_BLACKLIST, {
      reply_markup: { remove_keyboard: true },
    });
    return true;
  }
  return false;
};
