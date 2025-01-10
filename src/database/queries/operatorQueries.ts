import { QueryResult } from "pg";
import { db } from "../dbClient";

type OperatorStatus = "free" | "busy";

export interface Operator {
  operator_id: number;
  tg_account: string;
  phone: string;
  status: OperatorStatus;
  created_at: string; // Дата и время в ISO формате
}

// Функция для получения всех операторов по региону и статусу
export const getOperatorsByRegionAndStatus = async (
  regionId: number,
  status: OperatorStatus,
): Promise<Operator[]> => {
  try {
    const query = `
          SELECT *
            FROM operators o
            JOIN operators_regions orr ON o.operator_id = orr.operator_id
            WHERE orr.region_id = $1 AND o.status = $2;
        `;
    const result: QueryResult<Operator> = await db.query(query, [
      regionId,
      status,
    ]);

    return result.rows;
  } catch (error) {
    throw new Error("Error getOperatorByRegionAndStatus: " + error);
  }
};
export const findOperatorByTelegramId = async (
  operator_id: number | null,
  phone: string | null,
  tg_account: string | null,
): Promise<Operator> => {
  // Проверка, что хотя бы одно из значений передано
  if (!operator_id && !phone && !tg_account) {
    throw new Error(
      "At least one of accountId or phoneNumber must be provided.",
    );
  }

  try {
    const query = `
           SELECT 1 
           FROM operators 
           WHERE operator_id = $1 OR phone = $2 OR tg_account = $3
            ;`;
    const result: QueryResult<Operator> = await db.query(query, [
      operator_id,
      phone,
      tg_account,
    ]);
    return result.rows[0];
  } catch (error) {
    throw new Error("Error findOperatorByTelegramId: " + error);
  }
};
export const updateOperatorStatus = async (
  operatorId: number,
  status: OperatorStatus,
): Promise<void> => {
  try {
    const query = `
        UPDATE operators
        SET status = $1
        WHERE operator_id = $2;
    `;
    await db.query(query, [status, operatorId]);
  } catch (error) {
    throw new Error("Error findOperatorByTelegramId: " + error);
  }
};
