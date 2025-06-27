import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { WithdrawalLogsType } from "../db-types";

export async function getAllWithdrawalLogByUserId(
  userId: WithdrawalLogsType["user_id"],
  trx: poolType = pool,
): Promise<WithdrawalLogsType[]> {
  try {
    const result = await trx
      .selectFrom("withdrawal_logs")
      .selectAll()
      .where("user_id", "=", userId)
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllWithdrawalLogByUserId: " + error);
  }
}

export async function getAllWithdrawalLogByOperatorId(
  operatorId: WithdrawalLogsType["operator_id"],
  trx: poolType = pool,
): Promise<WithdrawalLogsType[]> {
  try {
    const result = await trx
      .selectFrom("withdrawal_logs")
      .selectAll()
      .where("operator_id", "=", operatorId)
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllWithdrawalLogByOperatorId: " + error);
  }
}

export async function getAllWithdrawalLogByAuditorId(
  auditor_id: WithdrawalLogsType["auditor_id"],
  trx: poolType = pool,
): Promise<WithdrawalLogsType[]> {
  try {
    const result = await trx
      .selectFrom("withdrawal_logs")
      .selectAll()
      .where("auditor_id", "=", auditor_id)
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllWithdrawalLogByAuditorId: " + error);
  }
}

export async function addWithdrawalLog(
  params: {
    auditor_id?: WithdrawalLogsType["auditor_id"];
    userId?: WithdrawalLogsType["user_id"];
    operatorId?: WithdrawalLogsType["operator_id"];
    amount: WithdrawalLogsType["amount"];
    wallet: WithdrawalLogsType["wallet"];
    amount_rub: WithdrawalLogsType["amount_rub"];
  },
  trx: poolType = pool,
): Promise<WithdrawalLogsType["withdrawal_id"] | null> {
  try {
    const {
      userId = null,
      operatorId = null,
      auditor_id = null,
      amount,
      wallet,
      amount_rub,
    } = params;

    const result = await trx
      .insertInto("withdrawal_logs")
      .values({
        user_id: userId,
        auditor_id: auditor_id,
        amount: amount,
        operator_id: operatorId,
        amount_rub: amount_rub,
        wallet,
        withdrawn_at: sql`CURRENT_TIMESTAMP`,
      })
      .returning("withdrawal_id")
      .executeTakeFirst();
    return result?.withdrawal_id ?? null;
  } catch (error) {
    throw new Error("Error addWithdrawalLog: " + error);
  }
}
