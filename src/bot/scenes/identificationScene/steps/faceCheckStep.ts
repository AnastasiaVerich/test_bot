import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../../types/type";
import { MESSAGES } from "../../../constants/messages";
import { FaceCheckStepResponseText } from "../../../../config/common_types";
import { updateUserLastInit } from "../../../../database/queries/userQueries";
import { getUserId, returnUserId } from "../../../utils/getUserId";
import logger from "../../../../lib/logger";
import { WebAppKeyboard } from "../../../keyboards/WebAppKeyboard";

export async function faceCheckStep(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<FaceCheckStepResponseText> {
  let text: FaceCheckStepResponseText = "some_error";
  try {
    const userId = await getUserId(ctx);

    if (!userId) return text;

    // Проверяем фото пользователя
    await ctx.reply(MESSAGES.VERIFY_BY_PHOTO, {
      reply_markup: WebAppKeyboard(userId, "", "identification", "0"),
    });

    const message_web_app_data = await conversation.waitFor(
      "message:web_app_data",
    );

    if (message_web_app_data.message?.web_app_data) {
      const data = await JSON.parse(
        message_web_app_data.message.web_app_data.data,
      );
      text = data.text;
    }
    if (text === "success") await updateUserLastInit(userId);

    return text;
  } catch (error) {
    const userId = await returnUserId(ctx);

    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error(userId + ": Error faceCheckStep: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
    return text;
  }
}
