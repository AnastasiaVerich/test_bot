import { entitiesType, MyContext } from "../types/type";
import { getUserId } from "../utils/getUserId";
import {
  allPendingPayment,
  getBalance,
  getCurse,
} from "../../database/services/paymentService";
import { HANDLER_BALANCE } from "../constants/handler_callback_queries";
import { BalanceMenuInlineKeyboard } from "../keyboards/inlineKeyboard";
import logger from "../../lib/logger";

export async function handleMessageBalance(
  ctx: MyContext,
  role: entitiesType,
): Promise<any | void> {
  try {
    let curse_info = await getCurse();
    if (!curse_info) {
      return;
    }
    const curseTon = Number(curse_info.value);

    // Получаем ID текущего пользователя Telegram.
    const user_id = await getUserId(ctx);

    if (!user_id) return;

    const balance_rub = await getBalance(user_id, role);
    if (!balance_rub) {
      return ctx.reply(HANDLER_BALANCE.USER_ID_UNDEFINED);
    }
    const balance_ton = Number((balance_rub / curseTon).toFixed(2));
    const pending_payment = await allPendingPayment(user_id, role);

    // Форматируем ожидающие платежи
    const pendingPayment_show =
      pending_payment.length > 0
        ? pending_payment
            .map((e) => {
              const amount_ton = e.amount;
              const amount_rub = e.amount_rub;
              const wallet =
                e.wallet.length > 12
                  ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}`
                  : e.wallet;
              return `⏳ *${amount_ton} ${HANDLER_BALANCE.TON} ${HANDLER_BALANCE.OR} ${amount_rub} ${HANDLER_BALANCE.RUB}* — ${wallet}`;
            })
            .join("\n")
        : HANDLER_BALANCE.NO_PENDING_PAYMENT;

    const message =
      `💰 *${HANDLER_BALANCE.BALANCE}*:\n ${balance_rub} ${HANDLER_BALANCE.RUB} ${HANDLER_BALANCE.OR} ${balance_ton} ${HANDLER_BALANCE.TON}\n\n` +
      `🕒 *${HANDLER_BALANCE.BALANCE_PENDING}*\n${pendingPayment_show}`;

    return ctx.reply(message, {
      parse_mode: "Markdown",
      reply_markup: BalanceMenuInlineKeyboard(),
    });
  } catch (error) {
    logger.error("Error in handleBalance: " + error);
    await ctx.reply(HANDLER_BALANCE.SOME_ERROR);
  }
}
