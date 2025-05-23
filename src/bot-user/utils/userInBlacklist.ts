import { RESPONSES } from "../../bot-common/constants/responses";
import { MyContext } from "../../bot-common/types/type";
import { isUserInBlacklist } from "../../database/queries_kysely/blacklist_users";

export const userInBlacklist = async (
  accountId: number | null,
  phoneNumber: string | null,
  ctx: MyContext,
): Promise<boolean> => {
  const blackList = await isUserInBlacklist({
    account_id: accountId,
    phone: phoneNumber,
  });

  if (blackList) {
    await ctx.reply(RESPONSES.YOU_IN_BLACKLIST, {
      reply_markup: { remove_keyboard: true },
    });
    return true;
  }
  return false;
};
