import { pool, poolType } from "../dbClient";
import { BlacklistUsersType } from "../db-types";

export async function isUserInBlacklist(
  params: {
    account_id?: BlacklistUsersType["account_id"];
    phone?: BlacklistUsersType["phone"];
  },
  trx: poolType = pool,
): Promise<boolean> {
  try {
    const { account_id, phone } = params;

    if (account_id === undefined && phone === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("blacklist_users")
      .select(["blacklist_id"]) // Используем sql`` для сырого SQL
      .where((eb) => {
        const conditions = [];
        if (account_id !== undefined) {
          conditions.push(eb("account_id", "=", account_id));
        }
        if (phone !== undefined) {
          conditions.push(eb("phone", "=", phone));
        }
        return eb.or(conditions);
      })
      .limit(1)
      .executeTakeFirst();

    return !!result;
  } catch (error) {
    throw new Error("Error isUserInBlacklist: " + error);
  }
}

export async function addUserInBlacklist(
  params: {
    account_id?: BlacklistUsersType["account_id"];
    phone?: BlacklistUsersType["phone"];
    reason?: BlacklistUsersType["reason"];
  },
  trx: poolType = pool,
): Promise<BlacklistUsersType["blacklist_id"] | null> {
  try {
    const { account_id, phone, reason } = params;

    if (
      account_id === undefined &&
      phone === undefined &&
      reason === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    // Проверяем, существует ли запись с таким account_id или phone
    const existing = await trx
      .selectFrom("blacklist_users")
      .select("blacklist_id")
      .where((eb) =>
        eb.or([
          account_id !== undefined
            ? eb("account_id", "=", account_id)
            : eb.val(true),
          phone !== undefined ? eb("phone", "=", phone) : eb.val(true),
        ]),
      )
      .executeTakeFirst();

    if (existing) {
      // Если запись уже существует, возвращаем ее blacklist_id
      return existing.blacklist_id;
    }

    // Если записи нет, выполняем вставку
    const result = await trx
      .insertInto("blacklist_users")
      .values({
        account_id: account_id ?? null,
        phone: phone ?? null,
        reason: reason ?? null,
      })
      .returning("blacklist_id")
      .executeTakeFirst();

    return result?.blacklist_id ?? null;
  } catch (error) {
    throw new Error("Error addUserInBlacklist: " + error);
  }
}
