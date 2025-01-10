import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { MyContext } from "../types/type";
import { WEB_APP_URL } from "../../config/env";
import { BUTTONS_KEYBOARD } from "../constants/button";
import { MESSAGES } from "../constants/messages";
import { IdentificationResponseText } from "../../config/common_types";
import { updateUserLastInit } from "../../database/queries/userQueries";
import { getUserId } from "../utils/getUserId";
import logger from "../../lib/logger";

export async function faceCheckMiddleware(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<{
  isSuccess: boolean;
  text: IdentificationResponseText;
} | void> {
  try {
    let isSuccess = false;
    let text: IdentificationResponseText = "server_error";
    const userId = await getUserId(ctx);

    if (!userId) return { isSuccess, text };

    // Проверяем фото пользователя
    await ctx.reply(MESSAGES.VERIFY_BY_PHOTO, {
      reply_markup: new Keyboard()
        .webApp(
          BUTTONS_KEYBOARD.OpenAppButton,
          `${WEB_APP_URL}?data=${encodeURIComponent(
            JSON.stringify({
              userId,
              type: "identification",
              isSavePhoto: "0",
            }),
          )}`,
        )
        .resized(),
    });

    const message_web_app_data = await conversation.waitFor(
      "message:web_app_data",
    );

    if (message_web_app_data.message?.web_app_data) {
      const data = await JSON.parse(
        message_web_app_data.message.web_app_data.data,
      );
      text = data.text;

      if (data.text === "success") {
        await updateUserLastInit(userId);
        isSuccess = true;
      }
    }

    return { isSuccess, text };
  } catch (error) {
    logger.error("Error faceCheckMiddleware:", error);
    await ctx.reply(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  }
}
