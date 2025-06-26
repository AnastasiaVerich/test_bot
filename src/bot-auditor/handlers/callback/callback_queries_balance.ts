import logger from "../../../lib/logger";
import { HANDLER_BALANCE } from "../../../bot-common/constants/handler_callback_queries";
import { BalanceMenuInlineKeyboard } from "../../../bot-common/keyboards/inlineKeyboard";
import { MyContext } from "../../../bot-common/types/type";
import { getUserId } from "../../../bot-common/utils/getUserId";
import { getCommonVariableByLabel } from "../../../database/queries_kysely/common_variables";
import { getAllPendingPaymentByAuditorId } from "../../../database/queries_kysely/pending_payments";
import { getAuditorBalance } from "../../../database/queries_kysely/auditors";

export async function handleBalance(ctx: MyContext): Promise<any | void> {
  try {
    let curseInfo = await getCommonVariableByLabel("ton_rub_price");
    if (!curseInfo) {
      return;
    }
    const curseTon = Number(curseInfo.value);

    // Получаем ID текущего пользователя Telegram.
    const auditorId = await getUserId(ctx);

    if (!auditorId) return;

    const balance = await getAuditorBalance(auditorId);
    if (!balance) {
      return ctx.reply(HANDLER_BALANCE.USER_ID_UNDEFINED);
    }
    const balanceTon = Number((balance / curseTon).toFixed(2));
    const pendingPayment = await getAllPendingPaymentByAuditorId(auditorId);

    // Форматируем ожидающие платежи
    const pendingPayment_show =
      pendingPayment.length > 0
        ? pendingPayment
            .map((e) => {
              const amount = e.amount;
              const wallet =
                e.wallet.length > 12
                  ? `${e.wallet.slice(0, 6)}...${e.wallet.slice(-6)}`
                  : e.wallet;
              return `⏳ *${amount} ${HANDLER_BALANCE.TON}* — ${wallet}`;
            })
            .join("\n")
        : HANDLER_BALANCE.NO_PENDING_PAYMENT;

    const message =
      `💰 *${HANDLER_BALANCE.BALANCE}*:\n ${balance} ${HANDLER_BALANCE.RUB} ${HANDLER_BALANCE.OR} ${balanceTon} TON\n\n` +
      `🕒 *${HANDLER_BALANCE.BALANCE_PENDING}*\n${pendingPayment_show}`;
    if (Number(balance) === 0) {
      return ctx.reply(message, { parse_mode: "Markdown" });
    } else {
      return ctx.reply(message, {
        parse_mode: "Markdown",
        reply_markup: BalanceMenuInlineKeyboard(),
      });
    }
  } catch (error) {
    logger.error("Error in handleBalance: " + error);
    await ctx.reply(HANDLER_BALANCE.SOME_ERROR);
  }
}
