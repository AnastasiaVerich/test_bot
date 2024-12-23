import {db} from "../dbClient";
import {QueryResult} from "pg";

interface UserBalance {
    user_id: number;
    balance: number;  // Текущий баланс пользователя
    total_earned: number;  // Общая сумма заработка
    total_withdrawn: number;  // Общая сумма снятых средств
}

export async function checkBalance(userId: number):Promise<UserBalance | null> {
    // Проверка типа
    if (typeof userId !== 'number') {
        throw new Error('Invalid type provided');
    }

    try {
        const query = 'SELECT * FROM user_balance WHERE user_id = $1';
        const result: QueryResult<UserBalance> = await db.query(query, [userId]);
        return result.rows[0] ?? null;
    } catch (error) {
        console.error('Error fetching user balance by user ID:', error);
        throw new Error('Error fetching user balance by user ID from the database');
    }
}

