import { QueryResult } from "pg";
import { db } from "../dbClient";

interface WithdrawalLog {
  withdrawal_id: number;
  user_id: number;
  amount: number;
  wallet: string;
  withdrawn_at: string;
}

export async function selectWithdrawalLogByUserId(
  userId: number | string,
): Promise<WithdrawalLog[]> {
  if (!(typeof userId === "number" || typeof userId === "string")) {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `SELECT * FROM withdrawal_logs WHERE user_id = $1`;

    const result: QueryResult<WithdrawalLog> = await db.query(query, [userId]);

    return result.rows;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error selectWithdrawalLogByUserId: " + shortError);
  }
}

export async function addWithdrawalLog(
  userId: number | string,
  amount: number,
  wallet: string,
): Promise<void> {
  try {
    const query =
      "INSERT INTO withdrawal_logs (user_id, amount, wallet, withdrawn_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)";
    await db.query(query, [userId, amount, wallet]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addWithdrawalLog: " + shortError);
  }
}
