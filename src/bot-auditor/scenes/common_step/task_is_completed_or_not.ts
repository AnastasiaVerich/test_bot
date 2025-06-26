import {
  MyConversation,
  MyConversationContext,
} from "../../../bot-common/types/type";
import { SurveyTasksType } from "../../../database/db-types";
import { COMMON_STEPS } from "../../../bot-common/constants/scenes";
import { YesNoKeyboard } from "../../../bot-common/keyboards/keyboard";
import { BUTTONS_KEYBOARD } from "../../../bot-common/constants/buttons";
import logger from "../../../lib/logger";

export async function taskCompletedOrNotStep(
  conversation: MyConversation,
  ctx: MyConversationContext,
  survey_task: SurveyTasksType,
) {
  try {
    await ctx.reply(
      COMMON_STEPS.ENTER_COMPLETED_OR_NOT +
        `\n\n${survey_task.description.replaceAll("/n", "\n")}`,
      {
        parse_mode: "HTML",
        reply_markup: YesNoKeyboard(),
      },
    );

    let result: string | null = null;
    //Два выхода из цикла — контакт юзера получен либо произошла ошибка(скорее всего на стороне тг)
    while (true) {
      const response = await conversation.waitForHears(
        [BUTTONS_KEYBOARD.YesButton, BUTTONS_KEYBOARD.NoButton],
        {
          otherwise: (ctx) =>
            ctx.reply(COMMON_STEPS.ENTER_COMPLETED_OR_NOT_OTHERWISE, {
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
    logger.error("Error in  completedOrNotStep", error);
    return null;
  }
}
