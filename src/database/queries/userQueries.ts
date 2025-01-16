import { QueryResult } from "pg";
import { db } from "../dbClient";

type UserStatus = "free" | "busy";

export interface User {
  user_id: number;
  phone: string;
  survey_lock_until: string | null; // Возможно, в ISO строке
  status: UserStatus;
  created_at: string; // Дата и время в ISO формате
  last_init: string; // Дата и время в ISO формате
  updated_at: string; // Дата и время в ISO формате
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
      "INSERT INTO users (user_id, phone, created_at, updated_at) VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
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

export async function updateUserStatus(
  userId: number,
  status: UserStatus,
): Promise<void> {
  try {
    const query = `UPDATE users SET status = $1, updated_at = NOW() WHERE user_id = $2;`;
    await db.query(query, [status, userId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error updateUserStatus: " + shortError);
  }
}

export async function updateUserLastInit(userId: number): Promise<void> {
  try {
    const query = `UPDATE users SET last_init = NOW(), updated_at = NOW() WHERE user_id = $1;`;
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
