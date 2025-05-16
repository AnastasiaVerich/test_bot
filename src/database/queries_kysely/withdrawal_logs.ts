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

export async function addWithdrawalLog(
  params: {
    userId: WithdrawalLogsType["user_id"];
    amount: WithdrawalLogsType["amount"];
    wallet: WithdrawalLogsType["wallet"];
  },
  trx: poolType = pool,
): Promise<void> {
  try {
    const { userId, amount, wallet } = params;

    await trx
      .insertInto("withdrawal_logs")
      .values({
        user_id: userId,
        amount: amount,
        wallet,
        withdrawn_at: sql`CURRENT_TIMESTAMP`,
      })
      .execute();
  } catch (error) {
    throw new Error("Error addWithdrawalLog: " + error);
  }
}
