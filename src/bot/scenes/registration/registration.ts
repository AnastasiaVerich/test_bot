import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../types/type";
import { AuthUserKeyboard } from "../../keyboards/AuthUserKeyboard";
import { REGISTRATION_SCENE } from "../../constants/scenes";
import { MESSAGES } from "../../constants/messages";
import logger from "../../../lib/logger";
import { getUserId } from "../../utils/getUserId";
import { numberStep } from "./steps/numberStep";
import { photoFinishStep } from "./steps/photoFinishStep";

export async function registrationScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<void> {
  try {
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Шаг 1: Ожидаем номер телефона
    const userPhone = await numberStep(conversation, ctx);

    // Шаг 2: Проверяем фото пользователя
    let response_text = await photoFinishStep(
      conversation,
      ctx,
      userPhone,
      userId,
    );

    switch (response_text) {
      case "user_exist_number":
      case "user_exist_id":
      case "user_exist_face":
        {
          await ctx.reply(REGISTRATION_SCENE.USER_EXIST);
        }
        break;
      case "user_is_block":
        {
          await ctx.reply(REGISTRATION_SCENE.USER_IN_BLOCK);
        }
        break;
      case "success":
        {
          await ctx.reply(REGISTRATION_SCENE.SUCCESS, {
            reply_markup: AuthUserKeyboard(),
          });
        }
        break;
      default: {
        await ctx.reply(REGISTRATION_SCENE.FAILED);
      }
    }
    return;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error in registrationScene: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR);
  }
}
