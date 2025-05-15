import {pool, poolType} from "../dbClient";
import {BlacklistUsersType} from "../db-types";


export async function isUserInBlacklist(
    params: {
        account_id?: BlacklistUsersType['account_id'],
        phone?: BlacklistUsersType['phone'],
    },
    trx: poolType = pool
): Promise<boolean> {
    try {
        const {account_id, phone} = params

        if (account_id === undefined && phone === undefined) {
            throw new Error(
                `At least one ( ${Object.keys(params).join(', ')} ) must be provided.`,
            );
        }

        const result = await trx
            .selectFrom('blacklist_users')
            .select(['blacklist_id']) // Используем sql`` для сырого SQL
            .where((eb) => {
                const conditions = [];
                if (account_id !== undefined) {
                    conditions.push(eb('account_id', '=', account_id));
                }
                if (phone !== undefined) {
                    conditions.push(eb('phone', '=', phone));
                }
                return eb.or(conditions);
            })
            .limit(1)
            .executeTakeFirst();

        return !!result;
    } catch (error) {
        throw new Error('Error isUserInBlacklist: ' + error)
    }
}
