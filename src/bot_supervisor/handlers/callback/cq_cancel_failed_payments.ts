import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { HANDLER_CANCEL_FAILED_PAYMENT } from "../../../bot-common/constants/handler_messages";
import { getAllPendingPayment } from "../../../database/queries_kysely/pending_payments";
import { AuthSupervisorKeyboard } from "../../../bot-common/keyboards/keyboard";
import { cancelThisPendingPayments } from "../../../database/services/paymentService";

export const handleCQCancelFailedPayments = async (ctx: MyContext) => {
  try {
    const allPendingPayment = await getAllPendingPayment();
    const failedPendingPayment = allPendingPayment.filter(
      (el) => el.attempts >= 3,
    );
    if (failedPendingPayment.length === 0) {
      await ctx.reply(HANDLER_CANCEL_FAILED_PAYMENT.NO_FAILED_PENDING_PAYMENTS);
      return;
    }
    let pending_payments_show = "";
    failedPendingPayment.forEach((e) => {
      const amount = e.amount;
      const wallet =
        e.wallet.length > 12
          ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}`
          : e.wallet;
      pending_payments_show += `${HANDLER_CANCEL_FAILED_PAYMENT.SUMMA} ${amount}, ${HANDLER_CANCEL_FAILED_PAYMENT.WALLET} ${wallet}\n\n`;
    });

    await ctx.reply(pending_payments_show);

    for (const el of failedPendingPayment) {
      if (el.user_id) {
        await cancelThisPendingPayments(el.user_id, el, "user");
      } else if (el.operator_id) {
        await cancelThisPendingPayments(el.operator_id, el, "operator");
      } else if (el.auditor_id) {
        await cancelThisPendingPayments(el.auditor_id, el, "auditor");
      }
    }
    await ctx.reply(HANDLER_CANCEL_FAILED_PAYMENT.SUCCESS, {
      parse_mode: "HTML",
      reply_markup: AuthSupervisorKeyboard(),
    });
  } catch (error) {
    logger.error("Error in handleRestartFailedPayments: " + error);
    await ctx.reply(HANDLER_CANCEL_FAILED_PAYMENT.SOME_ERROR);
  }
};
