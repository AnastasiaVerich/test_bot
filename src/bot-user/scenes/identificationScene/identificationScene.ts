import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../types/type";
import { AuthUserKeyboard } from "../../../bot-user/keyboards/AuthUserKeyboard";
import { faceCheckStep } from "./steps/faceCheckStep";
import { IDENTIFICATION_SCENE } from "../../constants/scenes";
import logger from "../../../lib/logger";
import { MESSAGES } from "../../constants/messages";
import { returnUserId } from "../../utils/getUserId";

export async function identificationScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<void> {
  try {
    const text = await faceCheckStep(conversation, ctx);

    switch (text) {
      case "user_is_block":
        {
          await ctx.reply(IDENTIFICATION_SCENE.USER_IN_BLOCK);
        }
        break;
      case "similarity_not_confirmed":
        {
          await ctx.reply(IDENTIFICATION_SCENE.NOT_SIMILAR);
        }
        break;
      case "success":
        {
          await ctx.reply(IDENTIFICATION_SCENE.SUCCESS, {
            reply_markup: AuthUserKeyboard(),
          });
        }
        break;
      default: {
        await ctx.reply(IDENTIFICATION_SCENE.FAILED);
        new Error(text);
      }
    }
    return;
  } catch (error) {
    const userId = await returnUserId(ctx);

    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error(userId + ": Error in identificationScene: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR);
    return;
  }
}
