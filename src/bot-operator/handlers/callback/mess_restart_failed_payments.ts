import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_RESTART_FAILED_PAYMENT } from "../../../bot-common/constants/handler_messages";
import {
  getAllPendingPayment,
  updateAttemptPendingPayment,
} from "../../../database/queries_kysely/pending_payments";
import { AuthSupervisorKeyboard } from "../../../bot-common/keyboards/keyboard";

export const handleRestartFailedPayments = async (ctx: MyContext) => {
  try {
    const allPendingPayment = await getAllPendingPayment();
    const failedPendingPayment = allPendingPayment.filter(
      (el) => el.attempts >= 3,
    );
    if (failedPendingPayment.length === 0) {
      await ctx.reply(
        HANDLER_RESTART_FAILED_PAYMENT.NO_FAILED_PENDING_PAYMENTS,
      );
      return;
    }

    for (const el of failedPendingPayment) {
      await updateAttemptPendingPayment(el.user_id, { attempts: 0 });
    }
    await ctx.reply(HANDLER_RESTART_FAILED_PAYMENT.SUCCESS, {
      parse_mode: "HTML",
      reply_markup: AuthSupervisorKeyboard(),
    });
  } catch (error) {
    logger.error("Error in handleRestartFailedPayments: " + error);
    await ctx.reply(HANDLER_RESTART_FAILED_PAYMENT.SOME_ERROR);
  }
};
