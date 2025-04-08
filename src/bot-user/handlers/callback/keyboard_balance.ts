import { InlineKeyboard } from "grammy";
import { Message } from "grammy/types";
import { MyContext } from "../../types/type";
import { checkBalance } from "../../../database/queries/balanceQueries";
import { BUTTONS_CALLBACK_QUERIES } from "../../constants/button";
import { MESSAGES } from "../../constants/messages";
import { selectWithdrawalLogByUserId } from "../../../database/queries/withdrawalLogsQueries";
import { formatTimestamp } from "../../../lib/date";
import logger from "../../../lib/logger";
import { getUserId } from "../../utils/getUserId";

export async function handleBalance(
  ctx: MyContext,
): Promise<Message.TextMessage | void> {
  try {
    // Получаем ID текущего пользователя Telegram.
    const userId = await getUserId(ctx);

    if (!userId) return;

    const balance = await checkBalance(userId);
    const logs = await selectWithdrawalLogByUserId(userId);
    if (!balance) {
      return ctx.reply(MESSAGES.USER_ID_UNDEFINED);
    }
    if (Number(balance.balance) === 0) {
      return ctx.reply(
        `${MESSAGES.BALANCE} ${balance.balance}!\n\n${MESSAGES.BALANCE_HISTORY}\n${logs.map((e) => `${e.amount} ${formatTimestamp(Number(e.withdrawn_at))}`)}`,
      );
    } else {
      return ctx.reply(
          `${MESSAGES.BALANCE} ${balance.balance}!\n\n${MESSAGES.BALANCE_HISTORY}\n${logs.map((e) => `${e.amount} ${formatTimestamp(Number(e.withdrawn_at))}`)}`,
        {
          reply_markup: new InlineKeyboard().text(
            BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
            BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
          ),
        },
      );
    }
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error in keyboard balance: " + shortError);
    await ctx.reply(MESSAGES.SOME_ERROR);
  }
}
