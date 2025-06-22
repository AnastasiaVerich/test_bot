import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { AuditorsType } from "../db-types";

export async function getAuditorByIdPhoneOrTg(
  params: {
    auditor_id?: AuditorsType["auditor_id"];
    phone?: AuditorsType["phone"];
    tg_account?: AuditorsType["tg_account"];
  },
  trx: poolType = pool,
): Promise<AuditorsType | null> {
  try {
    const { auditor_id, phone, tg_account } = params;

    if (
      auditor_id === undefined &&
      phone === undefined &&
      tg_account === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("auditors")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (auditor_id !== undefined) {
          conditions.push(eb("auditor_id", "=", auditor_id));
        }
        if (phone !== undefined) {
          conditions.push(eb("phone", "=", phone));
        }
        if (tg_account !== undefined) {
          conditions.push(eb("tg_account", "=", tg_account));
        }
        return eb.or(conditions);
      })

      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getAuditorByIdPhoneOrTg: " + error);
  }
}

export async function updateAuditorByTgAccount(
  tg_account: AuditorsType["tg_account"],
  params: {
    auditor_id?: AuditorsType["auditor_id"];
    phone?: AuditorsType["phone"];
  },
  trx: poolType = pool,
): Promise<AuditorsType["auditor_id"] | null> {
  try {
    const { auditor_id, phone } = params;

    if (phone === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<AuditorsType> = {};

    if (auditor_id !== undefined) {
      set.auditor_id = auditor_id;
    }
    if (phone !== undefined) {
      set.phone = phone;
    }

    const result = await trx
      .updateTable("auditors")
      .set(set)
      .where("tg_account", "=", tg_account)
      .returning("auditor_id")
      .executeTakeFirst();
    return result?.auditor_id ?? null;
  } catch (error) {
    throw new Error("Error updateAuditorByTgAccount: " + error);
  }
}

export async function updateAuditorByAuditorId(
  auditor_id: AuditorsType["auditor_id"],
  params: {
    phone?: AuditorsType["phone"];
    add_balance?: AuditorsType["balance"];
  },
  trx: poolType = pool,
): Promise<AuditorsType["auditor_id"] | null> {
  try {
    const { phone, add_balance } = params;

    if (phone === undefined && add_balance === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<AuditorsType> = {};

    if (phone !== undefined) {
      set.phone = phone;
    }

    if (add_balance !== undefined) {
      set.balance = sql<number>`balance + ${add_balance}` as unknown as number;
    }

    const result = await trx
      .updateTable("auditors")
      .set(set)
      .where("auditor_id", "=", auditor_id)
      .returning("auditor_id")
      .executeTakeFirst();
    return result?.auditor_id ?? null;
  } catch (error) {
    throw new Error("Error updateAuditorByAuditorId: " + error);
  }
}

export async function addAuditor(
  tg_account: AuditorsType["tg_account"],
  trx: poolType = pool,
): Promise<AuditorsType["auditor_id"] | null> {
  try {
    const result = await trx
      .insertInto("auditors")
      .values({
        tg_account,
      })
      .returning("auditor_id")
      .executeTakeFirst();

    return result?.auditor_id ?? null;
  } catch (error) {
    throw new Error("Error addAuditor: " + error);
  }
}

export async function getAuditorBalance(
  auditor_id: AuditorsType["auditor_id"] | string,
  trx: poolType = pool,
): Promise<number | null> {
  try {
    const result = await trx
      .selectFrom("auditors")
      .select("balance")
      .where("auditor_id", "=", Number(auditor_id))
      .executeTakeFirst();

    return result?.balance ?? null;
  } catch (error) {
    throw new Error("Error getAuditorBalance: " + error);
  }
}
