import { MyContext } from "../types/type";
import { User } from "../../database/queries/userQueries";
import { isDateDifferenceAtLeast } from "../../lib/date";
import { Scenes } from "../scenes";

export const isUserMustInit = async (
  ctx: MyContext,
  user: User,
): Promise<boolean> => {
  let isInitLongTimeAgo = false;
  const nowDateTime = new Date();

  if (isDateDifferenceAtLeast(nowDateTime.toString(), user.last_init, 7)) {
    await ctx.conversation.enter(Scenes.IdentificationScene);
    isInitLongTimeAgo = true;
  }
  return isInitLongTimeAgo;
};
