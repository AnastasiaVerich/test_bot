import {db} from "../dbClient";
import {QueryResult} from "pg";

type PendingPayment = {
    userId: number;         // Идентификатор пользователя (связан с users)
    amount: number;         // Сумма платежа
    attempts: number;       // Количество попыток проведения платежа
    address: string;        // Адрес для платежа
    createdAt: Date;        // Дата создания записи
};

export async function getAllPendingPayment (): Promise<PendingPayment[]>{
    try {
        const query = 'SELECT * FROM pending_payments';
        const result: QueryResult<PendingPayment> = await db.query(query);
        return result.rows
    } catch (error) {
        console.error('Error addPendingPayment:', error);
        throw new Error('Error addPendingPayment');
    }
}
export async function addPendingPayment (userId: number, amount: number, address: string): Promise<void>{
    try {
        const query = 'INSERT INTO pending_payments (user_id, amount, address, created_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)';
        await db.query(query, [userId, amount, address]);
    } catch (error) {
        console.error('Error addPendingPayment:', error);
        throw new Error('Error addPendingPayment');
    }
}

export async function deletePendingPayment (userId: number): Promise<void>{
    try {
        const query = 'DELETE  FROM  pending_payments WHERE userId = $1;';
        await db.query(query, [userId]);
    } catch (error) {
        console.error('Error deletePendingPayment:', error);
        throw new Error('Error deletePendingPayment');
    }
}

export async function findPendingPaymentByUserId (userId: number): Promise<PendingPayment[]>{
    if (typeof userId !== 'number') {
        throw new Error('Invalid type provided');
    }

    try {
        const query = `SELECT * FROM pending_payments WHERE user_id = $1`;
        const result: QueryResult<PendingPayment> = await db.query(query, [userId]);
        return result.rows
    } catch (error) {
        console.error('Error findPendingPaymentByUserId:', error);
        throw new Error('Error findPendingPaymentByUserId');
    }
}

export async function updateAttemptPendingPayment (userId: number, attempts:number): Promise<void>{
    if (typeof userId !== 'number' || typeof attempts !== 'number') {
        throw new Error('Invalid type provided');
    }

    try {
        const query = `UPDATE pending_payments SET attempts = $1 WHERE user_id = $2`;
         await db.query(query, [userId, attempts]);
    } catch (error) {
        console.error('Error updateAttemptPendingPayment:', error);
        throw new Error('Error updateAttemptPendingPayment');
    }
}
