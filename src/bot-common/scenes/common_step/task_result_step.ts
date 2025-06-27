import { MyConversation, MyConversationContext } from "../../types/type";
import { COMMON_STEPS } from "../../constants/scenes";
import logger from "../../../lib/logger";

export async function taskResultStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
): Promise<string | null> {
  try {
    await ctx.reply(COMMON_STEPS.ENTER_RESULT);

    let result_position: any = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) => ctx.reply(COMMON_STEPS.ENTER_RESULT_OTHERWISE),
      });
      const userInput = response.message?.text.trim() ?? "";
      const number = Number(userInput); // Преобразуем в целое число

      if (isNaN(number) || number <= 0) {
        await ctx.reply(COMMON_STEPS.ENTERED_NOT_CORRECT_RESULT);
        continue;
      }
      result_position = number.toString();
      break;
    }
    return result_position;
  } catch (error) {
    logger.error("Error in  taskResultStep", error);

    return null;
  }
}
