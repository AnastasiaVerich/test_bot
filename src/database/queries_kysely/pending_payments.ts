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
    userId?: PendingPaymentsType["user_id"];
    operatorId?: PendingPaymentsType["operator_id"];
    amount: PendingPaymentsType["amount"];
    address: PendingPaymentsType["address"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const { userId = null, operatorId = null, amount, address } = params;

    const result = await trx
      .insertInto("pending_payments")
      .values({
        user_id: userId,
        operator_id: operatorId,
        amount,
        address,
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
    userId?: PendingPaymentsType["user_id"];
    operatorId?: PendingPaymentsType["operator_id"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const { userId, operatorId } = params;

    if (userId === undefined && operatorId === undefined) {
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
        return eb.or(conditions);
      })
      .returning("pending_payments_id")
      .executeTakeFirst();

    return result?.pending_payments_id ?? null;
  } catch (error) {
    throw new Error("Error deletePendingPayment: " + error);
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
    operatorId?: PendingPaymentsType["operator_id"];
    attempts?: PendingPaymentsType["attempts"];
  },
  trx: poolType = pool,
): Promise<PendingPaymentsType["user_id"] | null> {
  try {
    const { attempts, userId = null, operatorId = null } = params;
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
        return eb.or(conditions);
      })
      .returning("pending_payments_id")
      .executeTakeFirst();

    return result?.pending_payments_id ?? null;
  } catch (error) {
    throw new Error("Error updateAttemptPendingPayment: " + error);
  }
}
