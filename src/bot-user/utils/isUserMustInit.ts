import { isDateDifferenceAtLeast } from "../../lib/date";
import { ScenesUser } from "../scenes";
import { MyContext } from "../../bot-common/types/type";
import { UsersType } from "../../database/db-types";

export const isUserMustInit = async (
  ctx: MyContext,
  user: UsersType,
): Promise<boolean> => {
  let isInitLongTimeAgo = false;
  const nowDateTime = new Date();

  if (!user.last_init) return false;
  if (isDateDifferenceAtLeast(nowDateTime.toString(), user.last_init, 7)) {
    await ctx.conversation.enter(ScenesUser.IdentificationScene);
    isInitLongTimeAgo = true;
  }
  return isInitLongTimeAgo;
};
