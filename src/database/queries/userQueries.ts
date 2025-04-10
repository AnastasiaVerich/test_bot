import { QueryResult } from "pg";
import { db } from "../dbClient";


export interface User {
  user_id: number;
  phone: string;
  balance: number; // Текущий баланс пользователя
  survey_lock_until: string | null; // Возможно, в ISO строке
  last_init: string; // Дата и время в ISO формате

  created_at: string; // Дата и время в ISO формате
}

export async function findUserByTelegramId(
  telegramId: number,
): Promise<User | undefined> {
  if (typeof telegramId !== "number") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `SELECT * FROM users WHERE user_id = $1`;

    const result: QueryResult<User> = await db.query(query, [telegramId]);

    return result.rows[0];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error findUserByTelegramId: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error findUserByPhone: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error addUser: " + shortError);
  }
}


export async function updateUserLastInit(userId: number): Promise<void> {
  try {
    const query = `UPDATE users SET last_init = NOW() WHERE user_id = $1;`;
    await db.query(query, [userId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateUserLastInit: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error checkBalance: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateMinusUserBalance: " + shortError);
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
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updatePlusUserBalance: " + shortError);
  }
}

