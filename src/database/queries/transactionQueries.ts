import {db} from "../dbClient";

export async function createTransaction(userId: number, amount: number, status: string = "pending") {
    const result = await db.query(
        `INSERT INTO transactions (user_id, amount, status) VALUES ($1, $2, $3) RETURNING *`,
        [userId, amount, status]
    );
    return result.rows[0];
}

export async function updateTransactionStatus(transactionId: number, status: string) {
    const result = await db.query(
        `UPDATE transactions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
        [status, transactionId]
    );
    return result.rows[0];
}

export async function getPendingTransactions() {
    const result = await db.query(
        `SELECT * FROM transactions WHERE status = 'pending'`
    );
    return result.rows;
}
