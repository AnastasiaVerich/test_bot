import { MyConversation, MyConversationContext } from "../../types/type";
import { YesNoKeyboard } from "../../keyboards/keyboard";
import { BUTTONS_KEYBOARD } from "../../constants/buttons";
import logger from "../../../lib/logger";

export async function yesOrNotStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  text: {
    question: string;
    otherwise?: string;
  },
) {
  try {
    await ctx.reply(text.question, {
      parse_mode: "HTML",
      reply_markup: YesNoKeyboard(),
    });

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.YesButton, BUTTONS_KEYBOARD.NoButton],
        {
          otherwise: (ctx) =>
            ctx.reply(text.otherwise ?? "Нажмите на соответствующую кнопку", {
              parse_mode: "HTML",
              reply_markup: YesNoKeyboard(),
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
    logger.error("Error in  yesOrNotStep", error);
    return null;
  }
}
