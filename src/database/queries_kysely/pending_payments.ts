import {pool, poolType} from '../dbClient';
import {PendingPaymentsType} from "../db-types";


export async function getAllPendingPayment(
    trx: poolType = pool
): Promise<PendingPaymentsType[]> {

    try {
        const result = await trx
            .selectFrom('pending_payments')
            .selectAll()
            .execute();

        return result;
    } catch (error) {

        throw new Error('Error getAllPendingPayment: ' + error);
    }
}

export async function addPendingPayment(
    params: {
        userId: PendingPaymentsType['user_id'],
        amount: PendingPaymentsType['amount'],
        address: PendingPaymentsType['address'],
    },
    trx: poolType = pool
): Promise<PendingPaymentsType['user_id'] | null> {

    try {
        const {userId, amount, address} = params

        const result = await trx
            .insertInto('pending_payments')
            .values({
                user_id: userId,
                amount,
                address
            })
            .returning('user_id')
            .executeTakeFirst();

        return result?.user_id ?? null

    } catch (error) {
        throw new Error('Error addPendingPayment: ' + error);
    }
}

export async function deletePendingPayment(
    userId: PendingPaymentsType['user_id'],
    trx: poolType = pool
): Promise<PendingPaymentsType['user_id'] | null> {

    try {
        const result = await trx
            .deleteFrom('pending_payments')
            .where('user_id', '=', userId)
            .returning('user_id')
            .executeTakeFirst();

        return result?.user_id ?? null


    } catch (error) {
        throw new Error('Error deletePendingPayment: ' + error);
    }
}

export async function getAllPendingPaymentByUserId(
    userId: PendingPaymentsType['user_id'],
    trx: poolType = pool
): Promise<PendingPaymentsType[]> {

    try {
        const result = await trx
            .selectFrom('pending_payments')
            .selectAll()
            .where('user_id', '=', Number(userId))
            .execute();

        return result;
    } catch (error) {
        throw new Error('Error getAllPendingPaymentByUserId: ' + error);
    }
}

export async function updateAttemptPendingPayment(
    userId: PendingPaymentsType['user_id'],
    params: {
        attempts?: PendingPaymentsType['attempts'],
    },
    trx: poolType = pool
): Promise<PendingPaymentsType['user_id'] | null> {

    try {
        const {attempts} = params
        if (attempts === undefined) {
            throw new Error(
                `At least one ( ${Object.keys(params).join(', ')} ) must be provided.`,
            );
        }

        const set: Partial<PendingPaymentsType> = {};
        if (attempts !== undefined) {
            set.attempts = attempts;
        }

        const result = await trx
            .updateTable('pending_payments')
            .set(set)
            .where('user_id', '=', userId)
            .returning('user_id')
            .executeTakeFirst();

        return result?.user_id ?? null


    } catch (error) {
        throw new Error('Error updateAttemptPendingPayment: ' + error);
    }
}
