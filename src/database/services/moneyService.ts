import { PendingPaymentsType, UsersType } from "../db-types";
import {
  addPendingPayment,
  getAllPendingPaymentById,
} from "../queries_kysely/pending_payments";
import { getUserBalance, updateUserByUserId } from "../queries_kysely/users";
import {
  getAuditorBalance,
  updateAuditorByAuditorId,
} from "../queries_kysely/auditors";
import {
  getOperatorBalance,
  updateOperatorByOperatorId,
} from "../queries_kysely/operators";
import { pool, poolType } from "../dbClient";
import { entitiesType } from "../../bot-common/types/type";

export async function hasPendingPayment(
  id: number,
  type: entitiesType,
): Promise<boolean> {
  let pendingPayments = [];
  switch (type) {
    case "auditor":
      pendingPayments = await getAllPendingPaymentById({ auditor_id: id });

      break;
    case "operator":
      pendingPayments = await getAllPendingPaymentById({ operator_id: id });

      break;
    case "user":
      pendingPayments = await getAllPendingPaymentById({ user_id: id });
      break;
  }
  return pendingPayments.length > 0;
}

export async function getBalanceF(id: number, type: entitiesType) {
  let info;
  switch (type) {
    case "auditor":
      info = await getAuditorBalance(id);

      break;
    case "operator":
      info = await getOperatorBalance(id);

      break;
    case "user":
      info = await getUserBalance(id);
      break;
    default: {
      info = null;
    }
  }
  return info;
}

export async function addPendingPaymentF(
  id: number,
  type: entitiesType,
  params: {
    amount: PendingPaymentsType["amount"];
    wallet: PendingPaymentsType["wallet"];
  },
  trx: poolType = pool,
) {
  let pendingPaymentId;
  switch (type) {
    case "auditor":
      pendingPaymentId = await addPendingPayment(
        {
          auditor_id: id,
          amount: params.amount,
          wallet: params.wallet,
        },
        trx,
      );

      break;
    case "operator":
      pendingPaymentId = await addPendingPayment(
        {
          operator_id: id,
          amount: params.amount,
          wallet: params.wallet,
        },
        trx,
      );

      break;
    case "user":
      pendingPaymentId = await addPendingPayment(
        {
          user_id: id,
          amount: params.amount,
          wallet: params.wallet,
        },
        trx,
      );
      break;
    default: {
      pendingPaymentId = null;
    }
  }
  return pendingPaymentId;
}
export async function updateBalanceF(
  id: UsersType["user_id"],
  type: entitiesType,
  add_balance?: UsersType["balance"],
  trx: poolType = pool,
) {
  let updateId;
  switch (type) {
    case "auditor":
      updateId = await updateAuditorByAuditorId(
        id,
        {
          add_balance: add_balance,
        },
        trx,
      );

      break;
    case "operator":
      updateId = await updateOperatorByOperatorId(
        id,
        {
          add_balance: add_balance,
        },
        trx,
      );

      break;
    case "user":
      updateId = await updateUserByUserId(
        id,
        {
          add_balance: add_balance,
        },
        trx,
      );
      break;
    default: {
      updateId = null;
    }
  }
  return updateId;
}
export async function confirmWithdrawalMoney(params: {
  type: entitiesType;
  userId: number;
  amountTON: number;
  amountRub: number;
  wallet: string;
}) {
  try {
    const { type, userId, amountTON, amountRub, wallet } = params;

    return await pool.transaction().execute(async (trx) => {
      const pendingPaymentId = await addPendingPaymentF(
        userId,
        type,
        {
          amount: amountTON,
          wallet: wallet,
        },
        trx,
      );
      if (!pendingPaymentId) {
        throw new Error("pendingPaymentId failed");
      }
      const updateBalanceId = await updateBalanceF(
        userId,
        type,
        -amountRub,
        trx,
      );
      if (!updateBalanceId) {
        throw new Error("updateBalanceId failed");
      }
    });
  } catch (error) {
    throw new Error("Error in confirmWithdrawalMoney: " + error);
  }
}
