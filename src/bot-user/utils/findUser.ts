import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext, MyConversationContext} from "../../bot-common/types/type";
import {getUser} from "../../database/queries_kysely/users";
import {UsersType} from "../../database/db-types";

export const findUser = async (
  userId: number,
  ctx: MyContext | MyConversationContext,
): Promise<UsersType | undefined> => {
  const user = await getUser({user_id:userId});

  if (!user) {
    await ctx.reply(RESPONSES.YOU_NOT_AUTH, {
      reply_markup: { remove_keyboard: true },
    });
    return
  }
  return user;
};
