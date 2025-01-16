import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../../types/type";
import { RegistrationResponseText } from "../../../../config/common_types";
import { REGISTRATION_SCENE } from "../../../constants/scenes";
import { WebAppKeyboard } from "../../../keyboards/WebAppKeyboard";

export async function photoFinishStep(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
  userPhone: string,
  userId: number,
): Promise<RegistrationResponseText> {
  let response_text: RegistrationResponseText = "server_error";

  await ctx.reply(REGISTRATION_SCENE.VERIFY_BY_PHOTO, {
    reply_markup: WebAppKeyboard(userId, userPhone, "registration", "0"),
  });

  const message_web_app_data = await conversation.waitFor(
    "message:web_app_data",
  );

  if (message_web_app_data.message?.web_app_data) {
    const data = JSON.parse(message_web_app_data.message.web_app_data.data);
    response_text = data.text;
  }

  return response_text;
}
