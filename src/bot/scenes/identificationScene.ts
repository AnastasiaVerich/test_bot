import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../types/type";
import { AuthUserKeyboard } from "../keyboards/AuthUserKeyboard";
import { faceCheckMiddleware } from "../middleware/faceCheckMiddleware";
import { IDENTIFICATION_SCENE } from "../constants/scenes";
import logger from "../../lib/logger";
import { MESSAGES } from "../constants/messages";

export async function identificationScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<void> {
  try {
    const { text } = await faceCheckMiddleware(conversation, ctx);

    switch (text) {
      case "user_is_block":
        {
          logger.info("Пользователь заблокирован.");
          await ctx.reply(IDENTIFICATION_SCENE.USER_IN_BLOCK);
        }
        break;
      case "similarity_not_confirmed":
        {
          await ctx.reply(IDENTIFICATION_SCENE.NOT_SIMILAR);
          logger.info("Пользователь заблокирован.");
        }
        break;
      case "success":
        {
          await ctx.reply(IDENTIFICATION_SCENE.SUCCESS, {
            reply_markup: AuthUserKeyboard(),
          });
          logger.info("Пользователь заблокирован.");
        }
        break;
      default: {
        await ctx.reply(IDENTIFICATION_SCENE.FAILED);
      }
    }
    return;
  } catch (error) {
    logger.error("Error in identificationScene:", error);
    await ctx.reply(MESSAGES.SOME_ERROR);
    return;
  }
}
