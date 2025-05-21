import { PendingPaymentsType } from "../db-types";
import { db } from "../dbClient";
import logger from "../../lib/logger";
import { deletePendingPayment } from "../queries_kysely/pending_payments";
import { addWithdrawalLog } from "../queries_kysely/withdrawal_logs";

export async function paymentIsCompleted(
  payment: PendingPaymentsType,
): Promise<"ok" | undefined> {
  const client = await db.connect(); // Получаем клиента для транзакции

  try {
    await client.query("BEGIN"); // Начинаем транзакцию

    const isDeleted = await deletePendingPayment(payment.user_id);
    if (!isDeleted) {
      throw new Error("deletePendingPayment failed");
    }
    const isAdd = await addWithdrawalLog({
      userId: payment.user_id,
      amount: payment.amount,
      wallet: payment.address,
    });
    if (!isAdd) {
      throw new Error("addWithdrawalLog failed");
    }
    await client.query("COMMIT"); // Завершаем транзакцию
    return "ok";
  } catch (error) {
    await client.query("ROLLBACK"); // Откатываем при ошибке
    logger.error("Error paymentIsCompleted: " + error);
    return;
  } finally {
    client.release(); // Освобождаем клиента
  }
}
