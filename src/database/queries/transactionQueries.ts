import { db } from "../dbClient";

interface Transaction {
  user_id: number;
  amount: number; // Текущий баланс пользователя
  status: string; // Общая сумма заработка
}
export async function createTransaction(
  userId: number,
  amount: number,
  status: string = "pending",
): Promise<Transaction> {
  try {
    const result = await db.query(
      `INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING *`,
      [userId, amount, status],
    );
    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error createTransaction: " + shortError);
  }
}

export async function updateTransactionStatus(
  transactionId: number,
  status: string,
): Promise<Transaction> {
  try {
    const result = await db.query(
      `UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, transactionId],
    );
    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateTransactionStatus: " + shortError);
  }
}

export async function getPendingTransactions(): Promise<Transaction[]> {
  try {
    const result = await db.query(
      `SELECT * FROM transactions WHERE status = 'pending'`,
    );
    return result.rows;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getPendingTransactions: " + shortError);
  }
}
