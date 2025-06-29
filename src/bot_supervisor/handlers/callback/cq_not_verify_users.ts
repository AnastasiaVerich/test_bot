import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_GET_USER_LOGS } from "../../../bot-common/constants/handler_messages";

export const handleCQCheckNotVerifyUsers = async (ctx: MyContext) => {
  try {
    console.log(1);
  } catch (error) {
    logger.error("Error in handleCQCheckNotVerifyUsers: " + error);
    await ctx.reply(HANDLER_GET_USER_LOGS.SOME_ERROR);
  }
};
