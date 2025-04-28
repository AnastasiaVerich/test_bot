import { User } from "../../database/queries/userQueries";
import { isDateDifferenceAtLeast } from "../../lib/date";
import { ScenesUser } from "../scenes";
import {MyContext} from "../../bot-common/types/type";

export const isUserMustInit = async (
  ctx: MyContext,
  user: User,
): Promise<boolean> => {
  let isInitLongTimeAgo = false;
  const nowDateTime = new Date();

  if (isDateDifferenceAtLeast(nowDateTime.toString(), user.last_init, 7)) {
    await ctx.conversation.enter(ScenesUser.IdentificationScene);
    isInitLongTimeAgo = true;
  }
  return isInitLongTimeAgo;
};
