import {BlacklistUsersEntity} from "../db-types";
import {pool} from "../dbClient";

export async function isUserInBlacklist(
    account_id: BlacklistUsersEntity['account_id'],
    phone: BlacklistUsersEntity['phone'],
): Promise<boolean > {
    try {
        const result = await pool
            .selectFrom('blacklist_users')
            .select(['blacklist_id']) // Используем sql`` для сырого SQL
            .where((eb) =>
                eb.or([
                    eb('account_id', '=', account_id),
                    eb('phone', '=', phone),
                ]),
            )
            .limit(1)
            .executeTakeFirst();

        return !!result;
    } catch (error) {

        throw new Error('Error checkExistInBlockUser: ' + error)
    }
}
