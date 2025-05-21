import { getCommonVariableByLabel } from "../../database/queries_kysely/common_variables";
import { AuthSupervisorKeyboard } from "../../bot-common/keyboards/keyboard";
import { getAllPendingPayment } from "../../database/queries_kysely/pending_payments";
import { BUTTONS_CALLBACK_QUERIES } from "../../bot-common/constants/buttons";
import { CreateInlineKeyboard } from "../../bot-common/keyboards/inlineKeyboard";
import { MyContext } from "../../bot-common/types/type";
import logger from "../../lib/logger";
import { HANDLER_MANUAL_PAYMENT } from "../../bot-common/constants/handler_messages";

export const handleManualPayment = async (ctx: MyContext) => {
  try {
    const autoPayInfo = await getCommonVariableByLabel("auto_payments_enabled");
    if (!autoPayInfo) {
      return ctx.reply(HANDLER_MANUAL_PAYMENT.SOME_ERROR, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
    const onAutoPayment = autoPayInfo.value === "ON";
    if (onAutoPayment) {
      await ctx.reply(HANDLER_MANUAL_PAYMENT.AUTO_PAYMENT_ON, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
    const allPendingPayments = await getAllPendingPayment();
    const availablePendingPayment = onAutoPayment
      ? allPendingPayments.filter((el) => el.attempts >= 3)
      : allPendingPayments;

    if (availablePendingPayment.length > 0) {
      const wordStr = availablePendingPayment.map((e) => {
        const amount = e.amount;
        const address =
          e.address.length > 12
            ? `${e.address.slice(0, 6)}...${e.address.slice(-6)}`
            : e.address;
        return {
          label: amount + " " + address,
          value:
            BUTTONS_CALLBACK_QUERIES.ThisPendingPaymentInfo + "_" + e.user_id,
        };
      });
      await ctx.reply(HANDLER_MANUAL_PAYMENT.AVAILABLE_PAYMENTS, {
        parse_mode: "HTML",
        reply_markup: CreateInlineKeyboard(wordStr),
      });
    } else {
      await ctx.reply(HANDLER_MANUAL_PAYMENT.NO_AVAILABLE_PAYMENTS, {
        reply_markup: AuthSupervisorKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in handleManualPayment: " + error);
    await ctx.reply(HANDLER_MANUAL_PAYMENT.SOME_ERROR);
  }
};
