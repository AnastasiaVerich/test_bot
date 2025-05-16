import {OperatorsType, SupervisorType} from "../db-types";
import {pool, poolType} from "../dbClient";

export async function getSupervisorByIdPhoneOrTg(
    params: {
        supervisor_id?: SupervisorType['supervisor_id'],
        phone?: SupervisorType['phone'],
        tg_account?: SupervisorType['tg_account'],
    },
    trx: poolType = pool
): Promise<SupervisorType | null> {
    try {

        const {supervisor_id, phone, tg_account} = params

        if (supervisor_id === undefined && phone === undefined && tg_account === undefined) {
            throw new Error(
                `At least one ( ${Object.keys(params).join(', ')} ) must be provided.`,
            );
        }

        const result = await trx
            .selectFrom('supervisor')
            .selectAll()
            .where((eb) => {
                const conditions = [];
                if (supervisor_id !== undefined) {
                    conditions.push(eb('supervisor_id', '=', supervisor_id));
                }
                if (phone !== undefined) {
                    conditions.push(eb('phone', '=', phone));
                }
                if (tg_account !== undefined) {
                    conditions.push(eb('tg_account', '=', tg_account));
                }
                return eb.or(conditions);
            })

            .executeTakeFirst();

        return result ?? null;
    } catch (error) {
        throw new Error('Error getSupervisorByIdPhoneOrTg: ' + error);
    }
}

export async function updateSupervisorByTgAccount(
    tg_account: SupervisorType['tg_account'],
    params: {
        supervisor_id?: SupervisorType['supervisor_id'],
        phone?: SupervisorType['phone'],
    },
    trx: poolType = pool
): Promise<SupervisorType['supervisor_id'] | null> {


    try {
        const {supervisor_id, phone} = params

        if (supervisor_id === undefined && phone === undefined ) {
            throw new Error(
                `At least one ( ${Object.keys(params).join(', ')} ) must be provided.`,
            );
        }

        const set: Partial<SupervisorType> = {};

        if (supervisor_id !== undefined) {
            set.supervisor_id = supervisor_id;
        }
        if (phone !== undefined) {
            set.phone = phone;
        }
        const result = await trx
            .updateTable('supervisor')
            .set(set)
            .where('tg_account', '=', tg_account)
            .returning('supervisor_id')
            .executeTakeFirst();
        return result?.supervisor_id ?? null

    } catch (error) {

        throw new Error('Error updateSupervisorByTgAccount: ' + error);
    }
}
