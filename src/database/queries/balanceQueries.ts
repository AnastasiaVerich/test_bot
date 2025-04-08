import { QueryResult } from "pg";
import { db } from "../dbClient";

interface UserBalance {
  user_id: number;
  balance: number; // Текущий баланс пользователя
  total_earned: number; // Общая сумма заработка
  total_withdrawn: number; // Общая сумма снятых средств
}

export async function checkBalance(
  userId: number | string,
): Promise<UserBalance | null> {
  // Проверка типа
  if (!(typeof userId === "number" || typeof userId === "string")) {
    throw new Error("Invalid type provided");
  }

  try {
    const query = "SELECT * FROM user_balance WHERE user_id = $1";
    const result: QueryResult<UserBalance> = await db.query(query, [userId]);
    return result.rows[0] ?? null;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error checkBalance: " + shortError);
  }
}

export async function addUserBalance(
  userId: number,
  balance: number,
  totalEarned: number,
  totalWithdrawn: number,
): Promise<void> {
  try {
    const query = `
            INSERT INTO user_balance (user_id, balance, total_earned, total_withdrawn)
            VALUES ($1, $2, $3, $4)
            RETURNING *`;
    await db.query(query, [userId, balance, totalEarned, totalWithdrawn]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addUserBalance: " + shortError);
  }
}

export async function updateUserBalance(
  userId: number,
  amount: number,
): Promise<void> {
  try {
    const query = `UPDATE user_balance SET balance = balance - $1 WHERE user_id = $2`;
    await db.query(query, [amount, userId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateUserBalance: " + shortError);
  }
}
