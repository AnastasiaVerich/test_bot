import { QueryResult } from "pg";
import { db } from "../dbClient";
import logger from "../../lib/logger";

type NotifyReasonType = "finish_survey" | null;

export interface User {
  user_id: number;
  phone: string;
  balance: number; // Текущий баланс пользователя
  notify_reason: NotifyReasonType ;
  survey_lock_until: string | null; // Возможно, в ISO строке
  last_init: string; // Дата и время в ISO формате

  created_at: string; // Дата и время в ISO формате
}

export async function findUserByTelegramId(
  telegramId: number,
): Promise<User | undefined> {
  logger.info('start find user')
  if (typeof telegramId !== "number") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `SELECT * FROM users WHERE user_id = $1`;

    const result: QueryResult<User> = await db.query(query, [telegramId]);

    return result.rows[0];
  } catch (error) {

    throw new Error("Error findUserByTelegramId: " + error);
  }
}

export async function findUserByPhone(
  phone: string,
): Promise<User | undefined> {
  if (typeof phone !== "string") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `SELECT * FROM users WHERE phone = $1`;

    const result: QueryResult<User> = await db.query(query, [phone]);

    return result.rows[0];
  } catch (error) {

    throw new Error("Error findUserByPhone: " + error);
  }
}

export async function addUser(
  userId: number,
  userPhone: string,
): Promise<void> {
  try {
    const query =
      "INSERT INTO users (user_id, phone, balance) VALUES ($1, $2, 0)";
    await db.query(query, [userId, userPhone]);
  } catch (error) {

    throw new Error("Error addUser: " + error);
  }
}


export async function updateUserLastInit(userId: number): Promise<void> {
  try {
    const query = `UPDATE users SET last_init = NOW() WHERE user_id = $1;`;
    await db.query(query, [userId]);
  } catch (error) {

    throw new Error("Error updateUserLastInit: " + error);
  }
}
export async function updateUserNotifyReason(userId: number, notify_reason:NotifyReasonType ): Promise<void> {
  try {
    const query = `UPDATE users SET notify_reason = $2 WHERE user_id = $1;`;
    await db.query(query, [userId, notify_reason]);
  } catch (error) {

    throw new Error("Error updateUserNotifyReason: " + error);
  }
}


export async function checkBalance(
    userId: number | string,
): Promise<number | undefined> {

  try {
    const query = `SELECT * FROM users WHERE user_id = $1`;
    const result: QueryResult<User> = await db.query(query, [userId]);
    return result?.rows[0]?.balance ?? undefined;
  } catch (error) {

    throw new Error("Error checkBalance: " + error);
  }
}

export async function updateMinusUserBalance(
    userId: number,
    amount: number,
): Promise<void> {
  try {
    const query = `UPDATE users SET balance = balance - $1 WHERE user_id = $2`;
    await db.query(query, [amount, userId]);
  } catch (error) {

    throw new Error("Error updateMinusUserBalance: " + error);
  }
}
export async function updatePlusUserBalance(
    userId: number,
    amount: number,
): Promise<void> {
  try {
    const query = `UPDATE users SET balance = balance + $1 WHERE user_id = $2`;
    await db.query(query, [amount, userId]);
  } catch (error) {

    throw new Error("Error updatePlusUserBalance: " + error);
  }
}

