import {
  CommonVariablesType,
  PendingPaymentsType,
  ReferralBonusesType,
  SurveyCompletionsType,
  UsersType,
  WithdrawalLogsType,
} from "../db-types";
import logger from "../../lib/logger";
import {
  addPendingPayment,
  deletePendingPayment,
  getAllPendingPaymentById,
} from "../queries_kysely/pending_payments";
import {
  addWithdrawalLog,
  getAllWithdrawalLogById,
} from "../queries_kysely/withdrawal_logs";
import { pool, poolType } from "../dbClient";
import { entitiesType } from "../../bot-common/types/type";
import {
  getAuditorBalance,
  updateAuditorByAuditorId,
} from "../queries_kysely/auditors";
import {
  getOperatorBalance,
  updateOperatorByOperatorId,
} from "../queries_kysely/operators";
import { getUserBalance, updateUserByUserId } from "../queries_kysely/users";
import { getCommonVariableByLabel } from "../queries_kysely/common_variables";
import { getSurveyCompletionsById } from "../queries_kysely/survey_task_completions";
import { getAllReferralByrReferrerIdAndStatus } from "../queries_kysely/referral_bonuses";

export async function paymentIsCompleted(
  payment: PendingPaymentsType,
): Promise<string | undefined> {
  try {
    return await pool.transaction().execute(async (trx) => {
      let isDeleted;
      if (payment.user_id) {
        isDeleted = await deletePendingPayment(
          { user_id: payment.user_id },
          trx,
        );
      } else if (payment.operator_id) {
        isDeleted = await deletePendingPayment(
          {
            operator_id: payment.operator_id,
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
            amount_rub: payment.amount_rub,
          },
          trx,
        );
      } else if (payment.operator_id) {
        isAdd = await addWithdrawalLog(
          {
            operatorId: payment.operator_id,
            amount: payment.amount,
            wallet: payment.wallet,
            amount_rub: payment.amount_rub,
          },
          trx,
        );
      } else if (payment.auditor_id) {
        isAdd = await addWithdrawalLog(
          {
            auditor_id: payment.auditor_id,
            amount: payment.amount,
            wallet: payment.wallet,
            amount_rub: payment.amount_rub,
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

export async function allPendingPayment(
  id: number,
  type: entitiesType,
): Promise<PendingPaymentsType[]> {
  let pendingPayments: PendingPaymentsType[] = [];
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
  return pendingPayments;
}

export async function getAllWithdrawalLog(
  id: number,
  type: entitiesType,
): Promise<WithdrawalLogsType[]> {
  let withdrawal_logs: WithdrawalLogsType[] = [];
  switch (type) {
    case "auditor":
      withdrawal_logs = await getAllWithdrawalLogById({
        auditor_id: id,
      });

      break;
    case "operator":
      withdrawal_logs = await getAllWithdrawalLogById({
        operator_id: id,
      });

      break;
    case "user":
      withdrawal_logs = await getAllWithdrawalLogById({ user_id: id });
      break;
  }
  return withdrawal_logs;
}

export async function getAllSurveyRewards(
  id: number,
  type: entitiesType,
): Promise<SurveyCompletionsType[]> {
  let surveys: SurveyCompletionsType[] = [];
  switch (type) {
    case "auditor":
      surveys = [];

      break;
    case "operator":
      surveys = await getSurveyCompletionsById({
        operator_id: id,
      });

      break;
    case "user":
      surveys = await getSurveyCompletionsById({ user_id: id });
      break;
  }
  return surveys;
}

export async function deletePendingPaymentByRole(
  id: number,
  type: entitiesType,
  trx: poolType = pool,
): Promise<number | null> {
  let delete_id = null;
  switch (type) {
    case "auditor":
      delete_id = await deletePendingPayment({ auditor_id: id });

      break;
    case "operator":
      delete_id = await deletePendingPayment({
        operator_id: id,
      });

      break;
    case "user":
      delete_id = await deletePendingPayment({ user_id: id });
      break;
  }
  return delete_id;
}

export async function getAllReferralRewards(
  user_id: number,
): Promise<ReferralBonusesType[]> {
  return getAllReferralByrReferrerIdAndStatus(user_id, "completed");
}

export async function getBalance(id: number, type: entitiesType) {
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
    amount_rub: PendingPaymentsType["amount_rub"];
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
          amount_rub: params.amount_rub,
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
          amount_rub: params.amount_rub,
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
          amount_rub: params.amount_rub,
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
          amount_rub: amountRub,
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

export async function getCurse(): Promise<CommonVariablesType | null> {
  try {
    return await getCommonVariableByLabel("ton_rub_price");
  } catch (error) {
    throw new Error("Error in getCurse: " + error);
  }
}

export async function cancelThisPendingPayments(
  id: number,
  payment: PendingPaymentsType,
  type: entitiesType,
) {
  try {
    return await pool.transaction().execute(async (trx) => {
      const delete_id = deletePendingPaymentByRole(id, type, trx);

      if (!delete_id) {
        throw new Error("deletePendingPaymentByRole failed");
      }
      const updateBalanceId = await updateBalanceF(
        id,
        type,
        payment.amount_rub,
        trx,
      );
      if (!updateBalanceId) {
        throw new Error("updateBalanceId failed");
      }
    });
  } catch (error) {
    throw new Error("Error in cancelThisPendingPayments: " + error);
  }
}
