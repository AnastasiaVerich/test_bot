import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_GET_USER_LOGS } from "../../../bot-common/constants/handler_messages";

export const handleCQCheckAllSameUsers = async (ctx: MyContext) => {
  try {
    console.log(2);
  } catch (error) {
    logger.error("Error in handleCQCheckAllSameUsers: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};
