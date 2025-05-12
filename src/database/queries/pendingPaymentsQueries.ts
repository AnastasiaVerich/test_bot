import { QueryResult } from "pg";
import { db } from "../dbClient";
import logger from "../../lib/logger";

export type PendingPayment = {
  user_id: number; // Идентификатор пользователя (связан с users)
  amount: number; // Сумма платежа
  attempts: number; // Количество попыток проведения платежа
  address: string; // Адрес для платежа

  created_at: string; // Дата создания записи
};

export async function getAllPendingPayment(): Promise<PendingPayment[]> {
  try {
    const query = "SELECT * FROM pending_payments";
    const result: QueryResult<PendingPayment> = await db.query(query);
    return result.rows;
  } catch (error) {

    throw new Error("Error getAllPendingPayment: " + error);
  }
}
export async function addPendingPayment(
  userId: number,
  amount: number,
  address: string,
): Promise<void> {
  try {
    const query =
      "INSERT INTO pending_payments (user_id, amount, address,attempts, created_at) VALUES ($1, $2, $3,0, CURRENT_TIMESTAMP)";
    await db.query(query, [userId, amount, address]);
  } catch (error) {

    throw new Error("Error addPendingPayment: " + error);
  }
}

export async function deletePendingPayment(userId: number): Promise<void> {
  try {
    const query = "DELETE  FROM  pending_payments WHERE user_id = $1;";
    await db.query(query, [userId]);
  } catch (error) {

    throw new Error("Error deletePendingPayment: " + error);
  }
}

export async function findPendingPaymentByUserId(
  userId: number | string,
): Promise<PendingPayment[]> {
  if (!(typeof userId === "number" || typeof userId === "string")) {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `SELECT * FROM pending_payments WHERE user_id = $1`;
    const result: QueryResult<PendingPayment> = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {

    throw new Error("Error findPendingPaymentByUserId: " + error);
  }
}

export async function updateAttemptPendingPayment(
  userId: number,
  attempts: number,
): Promise<void> {
  if (!(typeof userId === "number" || typeof userId === "string") || typeof attempts !== "number") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `UPDATE pending_payments SET attempts = $1 WHERE user_id = $2`;
    await db.query(query, [attempts, userId]);
  } catch (error) {

    throw new Error("Error updateAttemptPendingPayment: " + error);
  }
}
