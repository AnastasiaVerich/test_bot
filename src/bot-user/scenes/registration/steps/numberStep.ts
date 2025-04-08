import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { MyContext } from "../../../types/type";
import { REGISTRATION_SCENE } from "../../../constants/scenes";
import { BUTTONS_KEYBOARD } from "../../../constants/button";

export async function numberStep(
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
