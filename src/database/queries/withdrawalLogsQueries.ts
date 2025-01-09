import {QueryResult} from "pg";
import {db} from "../dbClient";

interface WithdrawalLog {
    withdrawal_id: number;
    user_id: number;
    amount: number;
    wallet: string;
    withdrawn_at: string;
}

export async function selectWithdrawalLogByUserId(userId: number):Promise<WithdrawalLog[]> {

    if (typeof userId !== 'number') {
        throw new Error('Invalid type provided');
    }

    try {
        const query = `SELECT * FROM withdrawal_logs WHERE user_id = $1`;

        const result: QueryResult<WithdrawalLog> = await db.query(query, [userId]);

        return result.rows;
    } catch (error) {
        console.log('Error selectWithdrawalLogByUserId:', error);
        throw new Error('Error selectWithdrawalLogByUserId');
    }
}
export async function addWithdrawalLog (userId: number, amount: number, wallet: number): Promise<void>{
    try {
        const query = 'INSERT INTO withdrawal_logs (user_id, amount, wallet, withdrawn_at) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)';
        await db.query(query, [userId, amount,wallet]);
    } catch (error) {
        console.error('Error addWithdrawalLog:', error);
        throw new Error('Error addWithdrawalLog');
    }
};
