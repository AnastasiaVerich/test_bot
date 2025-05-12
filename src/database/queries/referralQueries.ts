import { QueryResult } from "pg";
import { db } from "../dbClient";
import logger from "../../lib/logger";

interface ReferralBotStart {
  referred_user_id: number;
  referrer_id: number;
  amount:number;
  status:'pending' | 'completed';

  completed_at:string;
  created_at:string;
}

export async function addReferral(
  userId: number,
  referredId: number,
): Promise<ReferralBotStart | undefined> {
  // Проверка типа
  if (typeof userId !== "number" || typeof referredId !== "number") {
    throw new Error("Invalid type provided");
  }

  try {
    const query = `INSERT INTO referral_bonuses (referred_user_id, referrer_id) 
                    VALUES ($1, $2)
                    ON CONFLICT (referred_user_id) DO NOTHING
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

// Зачисляет сумму за реферал на счет и сюда в историю
export const completeReferralBonus = async (
    referredUserId: number,
    bonusAmount: number
): Promise<void> => {
  try {
    const query = `
      WITH updated_bonus AS (
        UPDATE referral_bonuses
        SET status = 'completed',
            amount = $2,
            completed_at = NOW()
        WHERE referred_user_id = $1
        AND status = 'pending'
        RETURNING referrer_id, amount
      )
      UPDATE users
      SET balance = balance + ub.amount
      FROM updated_bonus ub
      WHERE users.user_id = ub.referrer_id;
    `;

    await db.query(query, [referredUserId, bonusAmount]);
  } catch (error) {

    throw new Error("Error completeReferralBonus: " + error);
  }
};


export const getReferralAccrualHistory = async (userId: number): Promise<any[]> => {
  try {
    const query = `
      SELECT 
        completed_at AS accrual_date,
        amount AS amount,
        referred_user_id AS referred_user_id
      FROM referral_bonuses
      WHERE referrer_id = $1
      AND status = 'completed'
      ORDER BY completed_at DESC;
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
  } catch (error) {
    logger.info(error);

    throw new Error("Error getReferralAccrualHistory: " + error);
  }
};
