import { QueryResult } from "pg";
import { db } from "../dbClient";

interface BlacklistUser {
  blacklist_id: number;
  account_id: number | null; // ID аккаунта пользователя, если есть
  phone: string; // Номер телефона
  reason: string; // Причина блокировки
  added_at: string; // Дата добавления в блок-лист
}

export async function checkExistInBlockUser(
  accountId: number | null,
  phoneNumber: string | null,
): Promise<BlacklistUser> {
  // Проверка, что хотя бы одно из значений передано
  if (!accountId && !phoneNumber) {
    throw new Error(
      "At least one of accountId or phoneNumber must be provided.",
    );
  }

  try {
    // Строим запрос с условием проверки на account_id или phone_number
    const query = `
            SELECT 1 FROM blacklist_users WHERE account_id = $1 OR phone = $2 LIMIT 1;`;
    const result: QueryResult<BlacklistUser> = await db.query(query, [
      accountId,
      phoneNumber,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error checkExistInBlockUser: " + error);
  }
}
