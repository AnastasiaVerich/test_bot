import {QueryResult} from "pg";
import {db} from "../dbClient";

type OperatorStatus = 'free' | 'busy';

interface Operator {
    operator_id: number;
    tg_account: string;
    phone: string;
    status: OperatorStatus;
    created_at: string;  // Дата и время в ISO формате
}

// Функция для получения всех операторов по региону и статусу
export const getOperatorByRegionAndStatus = async (regionId: number, status: OperatorStatus): Promise<Operator[]> => {
    try {
        const query = `
          SELECT *
            FROM operators o
            JOIN operator_regions orr ON o.operator_id = orr.operator_id
            WHERE orr.region_id = $1 AND o.status = $2;
        `;
        const result: QueryResult<Operator> = await db.query(query, [regionId, status]);

        return result.rows;
    } catch (error) {
        console.error('Error getOperatorByRegionAndStatus:', error);
        throw new Error('Error getOperatorByRegionAndStatus');
    }
};
