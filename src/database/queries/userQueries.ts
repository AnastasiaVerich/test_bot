import {db} from "../dbClient";
import {QueryResult} from "pg";
type UserStatus = 'free' | 'busy';

interface User {
    user_id: number;
    phone: string;
    allowed_survey_after: string | null;  // Возможно, в ISO строке
    status: UserStatus;
    created_at: string;  // Дата и время в ISO формате
    last_init_date: string;  // Дата и время в ISO формате
    updated_at: string;  // Дата и время в ISO формате
}

export async function findUserByTelegramId(telegramId: number):Promise<User> {

    if (typeof telegramId !== 'number') {
        throw new Error('Invalid type provided');
    }

    try {
        const query = `SELECT * FROM users WHERE user_id = $1`;

        const result: QueryResult<User> = await db.query(query, [telegramId]);

        return result.rows[0];
    } catch (error) {
        console.log('Error findUserByTelegramId:', error);
        throw new Error('Error findUserByTelegramId');
    }
}
