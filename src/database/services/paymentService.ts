import { PendingPaymentsType } from "../db-types";
import logger from "../../lib/logger";
import { deletePendingPayment } from "../queries_kysely/pending_payments";
import { addWithdrawalLog } from "../queries_kysely/withdrawal_logs";
import { pool } from "../dbClient";

export async function paymentIsCompleted(
  payment: PendingPaymentsType,
): Promise<string | undefined> {
  try {
    return await pool.transaction().execute(async (trx) => {
      let isDeleted;
      if (payment.user_id) {
        isDeleted = await deletePendingPayment(
          { userId: payment.user_id },
          trx,
        );
      } else if (payment.operator_id) {
        isDeleted = await deletePendingPayment(
          {
            operatorId: payment.operator_id,
          },
          trx,
        );
      } else if (payment.auditor_id) {
        isDeleted = await deletePendingPayment(
          {
            auditor_id: payment.auditor_id,
          },
          trx,
        );
      }
      if (!isDeleted) {
        throw new Error("deletePendingPayment failed");
      }

      let isAdd;
      if (payment.user_id) {
        isAdd = await addWithdrawalLog(
          {
            userId: payment.user_id,
            amount: payment.amount,
            wallet: payment.wallet,
          },
          trx,
        );
      } else if (payment.operator_id) {
        isAdd = await addWithdrawalLog(
          {
            operatorId: payment.operator_id,
            amount: payment.amount,
            wallet: payment.wallet,
          },
          trx,
        );
      } else if (payment.auditor_id) {
        isAdd = await addWithdrawalLog(
          {
            auditor_id: payment.auditor_id,
            amount: payment.amount,
            wallet: payment.wallet,
          },
          trx,
        );
      }

      if (!isAdd) {
        throw new Error("addWithdrawalLog failed");
      }
      return "ok";
    });
  } catch (error) {
    logger.error("Error paymentIsCompleted: " + error);
    return;
  }
}
