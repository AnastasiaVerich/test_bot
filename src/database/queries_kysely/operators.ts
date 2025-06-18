import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { OperatorsType } from "../db-types";

export async function getOperatorByIdPhoneOrTg(
  params: {
    operator_id?: OperatorsType["operator_id"];
    phone?: OperatorsType["phone"];
    tg_account?: OperatorsType["tg_account"];
  },
  trx: poolType = pool,
): Promise<OperatorsType | null> {
  try {
    const { operator_id, phone, tg_account } = params;

    if (
      operator_id === undefined &&
      phone === undefined &&
      tg_account === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("operators")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (operator_id !== undefined) {
          conditions.push(eb("operator_id", "=", operator_id));
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
    throw new Error("Error getOperatorByIdPhoneOrTg: " + error);
  }
}

export async function updateOperatorByTgAccount(
  tg_account: OperatorsType["tg_account"],
  params: {
    operator_id?: OperatorsType["operator_id"];
    phone?: OperatorsType["phone"];
    can_take_multiple_surveys?: OperatorsType["can_take_multiple_surveys"];
  },
  trx: poolType = pool,
): Promise<OperatorsType["operator_id"] | null> {
  try {
    const { operator_id, phone, can_take_multiple_surveys } = params;

    if (
      operator_id === undefined &&
      phone === undefined &&
      can_take_multiple_surveys === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<OperatorsType> = {};

    if (operator_id !== undefined) {
      set.operator_id = operator_id;
    }
    if (phone !== undefined) {
      set.phone = phone;
    }
    if (can_take_multiple_surveys !== undefined) {
      set.can_take_multiple_surveys = can_take_multiple_surveys;
    }
    const result = await trx
      .updateTable("operators")
      .set(set)
      .where("tg_account", "=", tg_account)
      .returning("operator_id")
      .executeTakeFirst();
    return result?.operator_id ?? null;
  } catch (error) {
    throw new Error("Error updateOperatorByTgAccount: " + error);
  }
}

export async function updateOperatorByOperatorId(
  operator_id: OperatorsType["operator_id"],
  params: {
    phone?: OperatorsType["phone"];
    can_take_multiple_surveys?: OperatorsType["can_take_multiple_surveys"];
    add_balance?: OperatorsType["balance"];
  },
  trx: poolType = pool,
): Promise<OperatorsType["operator_id"] | null> {
  try {
    const { phone, can_take_multiple_surveys, add_balance } = params;

    if (
      phone === undefined &&
      add_balance === undefined &&
      can_take_multiple_surveys === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const set: Partial<OperatorsType> = {};

    if (phone !== undefined) {
      set.phone = phone;
    }
    if (can_take_multiple_surveys !== undefined) {
      set.can_take_multiple_surveys = can_take_multiple_surveys;
    }

    if (add_balance !== undefined) {
      set.balance = sql<number>`balance + ${add_balance}` as unknown as number;
    }

    const result = await trx
      .updateTable("operators")
      .set(set)
      .where("operator_id", "=", operator_id)
      .returning("operator_id")
      .executeTakeFirst();
    return result?.operator_id ?? null;
  } catch (error) {
    throw new Error("Error updateOperatorByTgAccount: " + error);
  }
}

export async function addOperator(
  tg_account: OperatorsType["tg_account"],
  trx: poolType = pool,
): Promise<OperatorsType["operator_id"] | null> {
  try {
    const result = await trx
      .insertInto("operators")
      .values({
        tg_account,
      })
      .returning("operator_id")
      .executeTakeFirst();

    return result?.operator_id ?? null;
  } catch (error) {
    throw new Error("Error addOperator: " + error);
  }
}

export async function getOperatorBalance(
  operatorId: OperatorsType["operator_id"] | string,
  trx: poolType = pool,
): Promise<number | null> {
  try {
    const result = await trx
      .selectFrom("operators")
      .select("balance")
      .where("operator_id", "=", Number(operatorId))
      .executeTakeFirst();

    return result?.balance ?? null;
  } catch (error) {
    throw new Error("Error getOperatorBalance: " + error);
  }
}
