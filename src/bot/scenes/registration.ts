import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { MyContext } from "../types/type";
import { WEB_APP_URL } from "../../config/env";
import { AuthUserKeyboard } from "../keyboards/AuthUserKeyboard";
import { REGISTRATION_SCENE } from "../constants/scenes";
import { BUTTONS_KEYBOARD } from "../constants/button";
import { RegistrationResponseText } from "../../config/common_types";
import { MESSAGES } from "../constants/messages";
import logger from "../../lib/logger";
import { getUserId } from "../utils/getUserId";

export async function registrationScene(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<void> {
  try {
    const userId = await getUserId(ctx);
    if (!userId) return;

    // Шаг 1: Ожидаем номер телефона
    const userPhone = await stepNumber(conversation, ctx);

    // Шаг 2: Проверяем фото пользователя
    let response_text = await stepPhotoAndRegistration(
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
    logger.error("Error in registrationScene:", error);
    await ctx.reply(MESSAGES.SOME_ERROR);
  }
}

async function stepNumber(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
): Promise<string> {
  await ctx.reply(REGISTRATION_SCENE.INPUT_PHONE, {
    parse_mode: "HTML", // Указываем, что текст содержит HTML
    reply_markup: new Keyboard()
      .requestContact(BUTTONS_KEYBOARD.SendNumberButton)
      .resized()
      .oneTime(),
  });

  const message = await conversation.waitFor("message:contact");

  return message.message?.contact?.phone_number;
}

async function stepPhotoAndRegistration(
  conversation: Conversation<MyContext>,
  ctx: MyContext,
  userPhone: string,
  userId: number,
): Promise<RegistrationResponseText> {
  let response_text: RegistrationResponseText = "server_error";

  await ctx.reply(REGISTRATION_SCENE.VERIFY_BY_PHOTO, {
    reply_markup: new Keyboard()
      .webApp(
        BUTTONS_KEYBOARD.OpenAppButton,
        `${WEB_APP_URL}?data=${encodeURIComponent(
          JSON.stringify({
            userPhone,
            userId,
            type: "registration",
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
    const data = JSON.parse(message_web_app_data.message.web_app_data.data);
    response_text = data.text;
  }

  return response_text;
}
