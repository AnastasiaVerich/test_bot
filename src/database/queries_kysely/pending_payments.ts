import { pool, poolType } from "../dbClient";
import { PendingPaymentsType } from "../db-types";

export async function getAllPendingPayment(
  trx: poolType = pool,
): Promise<PendingPaymentsType[]> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllPendingPayment: " + error);
  }
}

export async function addPendingPayment(
  params: {
    user_id?: PendingPaymentsType["user_id"];
    auditor_id?: PendingPaymentsType["auditor_id"];
    operator_id?: PendingPaymentsType["operator_id"];
    amount: PendingPaymentsType["amount"];
    wallet: PendingPaymentsType["wallet"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const {
      user_id = null,
      operator_id = null,
      auditor_id = null,
      amount,
      wallet,
    } = params;

    const result = await trx
      .insertInto("pending_payments")
      .values({
        user_id: user_id,
        operator_id: operator_id,
        auditor_id: auditor_id,
        amount,
        wallet,
      })
      .returning("pending_payments_id")
      .executeTakeFirst();

    return result?.pending_payments_id ?? null;
  } catch (error) {
    throw new Error("Error addPendingPayment: " + error);
  }
}

export async function deletePendingPayment(
  params: {
    auditor_id?: PendingPaymentsType["auditor_id"];
    userId?: PendingPaymentsType["user_id"];
    operatorId?: PendingPaymentsType["operator_id"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const { userId, operatorId, auditor_id } = params;

    if (
      userId === undefined &&
      operatorId === undefined &&
      auditor_id === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .deleteFrom("pending_payments")
      .where((eb) => {
        const conditions = [];
        if (userId !== undefined) {
          conditions.push(eb("user_id", "=", userId));
        }
        if (operatorId !== undefined) {
          conditions.push(eb("operator_id", "=", operatorId));
        }
        if (auditor_id !== undefined) {
          conditions.push(eb("auditor_id", "=", auditor_id));
        }
        return eb.or(conditions);
      })
      .returning("pending_payments_id")
      .executeTakeFirst();

    return result?.pending_payments_id ?? null;
  } catch (error) {
    throw new Error("Error deletePendingPayment: " + error);
  }
}

export async function getAllPendingPaymentById(
  params: {
    user_id?: PendingPaymentsType["user_id"];
    auditor_id?: PendingPaymentsType["auditor_id"];
    operator_id?: PendingPaymentsType["operator_id"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType[]> {
  try {
    const { user_id = null, operator_id = null, auditor_id = null } = params;
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (user_id !== undefined) {
          conditions.push(eb("user_id", "=", user_id));
        }
        if (operator_id !== undefined) {
          conditions.push(eb("operator_id", "=", operator_id));
        }
        if (auditor_id !== undefined) {
          conditions.push(eb("auditor_id", "=", auditor_id));
        }
        return eb.or(conditions);
      })
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllPendingPaymentById: " + error);
  }
}
export async function getAllPendingPaymentByUserId(
  userId: PendingPaymentsType["user_id"],
  trx: poolType = pool,
): Promise<PendingPaymentsType[]> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where("user_id", "=", Number(userId))
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllPendingPaymentByUserId: " + error);
  }
}
export async function getAllPendingPaymentByOperatorId(
  operatorId: PendingPaymentsType["operator_id"],
  trx: poolType = pool,
): Promise<PendingPaymentsType[]> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where("operator_id", "=", Number(operatorId))
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllPendingPaymentByOperatorId: " + error);
  }
}

export async function getAllPendingPaymentByAuditorId(
  auditor_id: PendingPaymentsType["auditor_id"],
  trx: poolType = pool,
): Promise<PendingPaymentsType[]> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where("auditor_id", "=", Number(auditor_id))
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllPendingPaymentByAuditorId: " + error);
  }
}

export async function getPendingPaymentByUserId(
  userId: PendingPaymentsType["user_id"],
  trx: poolType = pool,
): Promise<PendingPaymentsType | null> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where("user_id", "=", Number(userId))
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getPendingPaymentByUserId: " + error);
  }
}

export async function getPendingPaymentByOperatorId(
  operatorId: PendingPaymentsType["operator_id"],
  trx: poolType = pool,
): Promise<PendingPaymentsType | null> {
  try {
    const result = await trx
      .selectFrom("pending_payments")
      .selectAll()
      .where("operator_id", "=", Number(operatorId))
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getPendingPaymentByOperatorId: " + error);
  }
}

export async function updateAttemptPendingPayment(
  params: {
    userId?: PendingPaymentsType["user_id"];
    auditor_id?: PendingPaymentsType["auditor_id"];
    operatorId?: PendingPaymentsType["operator_id"];
    attempts?: PendingPaymentsType["attempts"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const {
      attempts,
      userId = null,
      auditor_id = null,
      operatorId = null,
    } = params;
    if (attempts === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<PendingPaymentsType> = {};
    if (attempts !== undefined) {
      set.attempts = attempts;
    }

    const result = await trx
      .updateTable("pending_payments")
      .set(set)
      .where((eb) => {
        const conditions = [];
        if (userId !== undefined) {
          conditions.push(eb("user_id", "=", userId));
        }
        if (operatorId !== undefined) {
          conditions.push(eb("operator_id", "=", operatorId));
        }
        if (auditor_id !== undefined) {
          conditions.push(eb("auditor_id", "=", auditor_id));
        }
        return eb.or(conditions);
      })
      .returning("pending_payments_id")
      .executeTakeFirst();

    return result?.pending_payments_id ?? null;
  } catch (error) {
    throw new Error("Error updateAttemptPendingPayment: " + error);
  }
}
