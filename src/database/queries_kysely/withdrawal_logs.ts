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

export async function addWithdrawalLog(
  params: {
    userId?: WithdrawalLogsType["user_id"];
    operatorId?: WithdrawalLogsType["operator_id"];
    amount: WithdrawalLogsType["amount"];
    wallet: WithdrawalLogsType["wallet"];
  },
  trx: poolType = pool,
): Promise<WithdrawalLogsType["withdrawal_id"] | null> {
  try {
    const { userId = null, operatorId = null, amount, wallet } = params;

    const result = await trx
      .insertInto("withdrawal_logs")
      .values({
        user_id: userId,
        amount: amount,
        operator_id: operatorId,
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
