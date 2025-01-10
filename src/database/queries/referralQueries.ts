import { QueryResult } from "pg";
import { db } from "../dbClient";

interface ReferralBotStart {
  tg_user_id: number;
  referral_creator_id: number;
  created_at: string; // Дата и время в ISO формате
}

export async function addReferral(
  userId: number,
  referredId: number,
): Promise<ReferralBotStart> {
  // Проверка типа
  if (typeof userId !== "number" || typeof referredId !== "number") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `INSERT INTO referral_bot_starts (tg_user_id, referral_creator_id) 
                    VALUES ($1, $2)
                    ON CONFLICT (tg_user_id) DO NOTHING
                    RETURNING *`;

    const result: QueryResult<ReferralBotStart> = await db.query(query, [
      userId,
      referredId,
    ]);

    return result.rows[0];
  } catch (error) {
    throw new Error("Error addReferral: " + error);
  }
}
