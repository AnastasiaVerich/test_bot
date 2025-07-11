import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { UsersType } from "../db-types";

export async function getUser(
  params: {
    user_id?: UsersType["user_id"];
    phone?: UsersType["phone"];
  },
  trx: poolType = pool,
): Promise<UsersType | null> {
  try {
    const { user_id, phone } = params;

    if (user_id === undefined && phone === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("users")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (user_id !== undefined) {
          conditions.push(eb("user_id", "=", user_id));
        }
        if (phone !== undefined) {
          conditions.push(eb("phone", "=", phone));
        }
        return eb.or(conditions);
      })
      .limit(1)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getUser: " + error);
  }
}

export async function getUsersByIds(
  user_ids: UsersType["user_id"][],
  trx: poolType = pool,
): Promise<UsersType[]> {
  try {
    if (!user_ids || user_ids.length === 0) {
      throw new Error("At least one user_id must be provided.");
    }

    const result = await trx
      .selectFrom("users")
      .selectAll()
      .where("user_id", "in", user_ids)
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getUsersByIds: " + error);
  }
}

export async function addUser(
  params: {
    userId: UsersType["user_id"];
    userPhone: UsersType["phone"];
    skip_photo_verification?: UsersType["skip_photo_verification"];
  },
  trx: poolType = pool,
): Promise<UsersType["user_id"] | null> {
  try {
    const { userId, userPhone, skip_photo_verification } = params;

    let skip = skip_photo_verification ?? false;

    const result = await trx
      .insertInto("users")
      .values({
        user_id: userId,
        phone: userPhone,
        balance: 0,
        skip_photo_verification: skip,
      })
      .returning("user_id")
      .executeTakeFirst();

    return result?.user_id ?? null;
  } catch (error) {
    throw new Error("Error addUser: " + error);
  }
}

export async function updateUserByUserId(
  userId: UsersType["user_id"],
  params: {
    last_init?: "update";
    notifyReason?: UsersType["notify_reason"];
    last_user_location?: UsersType["last_user_location"];
    last_tg_account?: UsersType["last_tg_account"];
    add_balance?: UsersType["balance"];
    interval_survey_lock_until?: UsersType["survey_lock_until"];
    is_supervisor_check?: UsersType["is_supervisor_check"];
  },
  trx: poolType = pool,
): Promise<UsersType["user_id"] | null> {
  try {
    const {
      last_init,
      notifyReason,
      add_balance,
      interval_survey_lock_until,
      last_user_location,
      last_tg_account,
      is_supervisor_check,
    } = params;

    if (
      last_init === undefined &&
      notifyReason === undefined &&
      add_balance === undefined &&
      interval_survey_lock_until === undefined &&
      last_user_location === undefined &&
      is_supervisor_check === undefined &&
      last_tg_account === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<UsersType> = {};

    if (notifyReason !== undefined) {
      set.notify_reason = notifyReason;
    }
    if (last_user_location !== undefined) {
      set.last_user_location = last_user_location;
    }
    if (last_tg_account !== undefined) {
      set.last_tg_account = last_tg_account;
    }
    if (is_supervisor_check !== undefined) {
      set.is_supervisor_check = is_supervisor_check;
    }
    if (last_init === "update") {
      set.last_init = sql<Date>`NOW()` as unknown as string;
    }
    if (add_balance !== undefined) {
      set.balance = sql<number>`balance + ${add_balance}` as unknown as number;
    }
    if (interval_survey_lock_until !== undefined) {
      set.survey_lock_until =
        sql`CURRENT_TIMESTAMP + ${interval_survey_lock_until}` as unknown as string;
    }

    const result = await trx
      .updateTable("users")
      .set(set)
      .where("user_id", "=", userId)
      .returning("user_id")

      .executeTakeFirst();
    return result?.user_id ?? null;
  } catch (error) {
    throw new Error("Error updateUserByUserId: " + error);
  }
}

export async function getUserBalance(
  userId: UsersType["user_id"] | string,
  trx: poolType = pool,
): Promise<number | null> {
  try {
    const result = await trx
      .selectFrom("users")
      .select("balance")
      .where("user_id", "=", Number(userId))
      .executeTakeFirst();

    return result?.balance ?? null;
  } catch (error) {
    throw new Error("Error getUserBalance: " + error);
  }
}

export async function getAllUsersWhereNotifyFinishSurvey(
  trx: poolType = pool,
): Promise<UsersType[]> {
  try {
    return trx
      .selectFrom("users")
      .selectAll()
      .where("notify_reason", "=", "finish_survey")
      .execute();
  } catch (error) {
    throw new Error("Error getAllUsersWhereNotifyFinishSurvey: " + error);
  }
}

export async function getUsersWithNoSupervisorCheck(
  trx: poolType = pool,
): Promise<UsersType[]> {
  try {
    return await trx
      .selectFrom("users")
      .selectAll()
      .where("is_supervisor_check", "=", false)
      .execute();
  } catch (error) {
    throw new Error("Error getUsersWithNoSupervisorCheck: " + error);
  }
}
