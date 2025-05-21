import { HANDLER_PENDING_PAYMENT_INFO } from "../../bot-common/constants/handler_callback_queries";
import { BUTTONS_CALLBACK_QUERIES } from "../../bot-common/constants/buttons";
import { MyContext } from "../../bot-common/types/type";
import logger from "../../lib/logger";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { ScenesSupervisor } from "../scenes";

export async function handlePendingPaymentInfo(ctx: MyContext): Promise<void> {
  try {
    const callbackData = ctx.callbackQuery?.data; // Получаем данные callback-запроса
    if (!callbackData) {
      await ctx.reply(HANDLER_PENDING_PAYMENT_INFO.ERROR_DATA_UNDEFINED);
      return;
    }

    // Извлекаем survey_active_id (число) из callbackData
    const match = callbackData.match(
      new RegExp(`^${BUTTONS_CALLBACK_QUERIES.ThisPendingPaymentInfo}_(\\d+)$`),
    );

    if (!match) {
      await ctx.reply(HANDLER_PENDING_PAYMENT_INFO.ERROR_DATA_INVALID);
      return;
    }
    const user_id = parseInt(match[1], 10);

    await ctx.conversation.enter(ScenesSupervisor.MakeAPayment, {
      state: { user_id: user_id },
    });
  } catch (error) {
    logger.error("Error in handleCancelSurvey: " + error);
    await ctx.reply(HANDLER_PENDING_PAYMENT_INFO.SOME_ERROR, {
      reply_markup: AuthSupervisorKeyboard(),
    });
  }
}
