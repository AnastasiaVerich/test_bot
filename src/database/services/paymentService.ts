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

    let isDeleted;
    if (payment.user_id) {
      isDeleted = await deletePendingPayment({ userId: payment.user_id });
    } else if (payment.operator_id) {
      isDeleted = await deletePendingPayment({
        operatorId: payment.operator_id,
      });
    }
    if (!isDeleted) {
      throw new Error("deletePendingPayment failed");
    }

    let isAdd;
    if (payment.user_id) {
      isAdd = await addWithdrawalLog({
        userId: payment.user_id,
        amount: payment.amount,
        wallet: payment.address,
      });
    } else if (payment.operator_id) {
      isAdd = await addWithdrawalLog({
        operatorId: payment.operator_id,
        amount: payment.amount,
        wallet: payment.address,
      });
    }

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
