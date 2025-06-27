import { Conversation } from "@grammyjs/conversations";
import { MyContext, MyConversationContext } from "../../types/type";
import { COMMON_STEPS } from "../../constants/scenes";
import { ConfirmCancelKeyboard } from "../../keyboards/keyboard";
import { BUTTONS_KEYBOARD } from "../../constants/buttons";
import logger from "../../../lib/logger";

export async function confirmStep(
  conversation: Conversation<MyContext, MyConversationContext>,
  ctx: MyConversationContext,
) {
  try {
    await ctx.reply(COMMON_STEPS.CONFIRMATION, {
      parse_mode: "HTML",
      reply_markup: ConfirmCancelKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.ConfirmButton, BUTTONS_KEYBOARD.CancelButton],
        {
          otherwise: (ctx) =>
            ctx.reply(COMMON_STEPS.CONFIRMATION_OTHERWISE, {
              parse_mode: "HTML",
              reply_markup: ConfirmCancelKeyboard(),
            }),
        },
      );

      if (!response.message?.text) break;

      result = response.message?.text;
      break;
    }

    if (!result) return null;
    return result;
  } catch (error) {
    logger.error("Error in  confirmStep", error);
    return null;
  }
}
