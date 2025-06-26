import {
  MyConversation,
  MyConversationContext,
} from "../../../bot-common/types/type";
import { COMMON_STEPS } from "../../../bot-common/constants/scenes";
import { CreateFromWordsKeyboard } from "../../../bot-common/keyboards/keyboard";
import logger from "../../../lib/logger";

export async function taskResultPositionsStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  data: any,
) {
  try {
    const { positions_var } = data;

    await ctx.reply(COMMON_STEPS.ENTER_RESULT_POS_VAR_1, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_1: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(COMMON_STEPS.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_1 = userInput;
      break;
    }
    await ctx.reply(COMMON_STEPS.ENTER_RESULT_POS_VAR_2, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_2: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(COMMON_STEPS.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_2 = userInput;
      break;
    }
    await ctx.reply(COMMON_STEPS.ENTER_RESULT_POS_VAR_3, {
      reply_markup: CreateFromWordsKeyboard(positions_var),
    });

    let result_3: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitFor("message:text", {
        otherwise: (ctx) =>
          ctx.reply(COMMON_STEPS.ENTER_RES_POS_OTHERWISE, {
            reply_markup: CreateFromWordsKeyboard(positions_var),
          }),
      });
      const userInput = response.message?.text.trim() ?? "";

      result_3 = userInput;
      break;
    }

    return [result_1, result_2, result_3];
  } catch (error) {
    logger.error("Error in  taskResultPositionsStep", error);

    return null;
  }
}
