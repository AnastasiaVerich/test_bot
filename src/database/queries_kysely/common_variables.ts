import { sql } from "kysely";
import { CommonVariablesType } from "../db-types";
import { pool, poolType } from "../dbClient";

export async function upsertCommonVariable(
  label: CommonVariablesType["label"],
  value: CommonVariablesType["value"],
  trx: poolType = pool,
): Promise<CommonVariablesType["common_vars_id"] | null> {
  try {
    const result = await trx
      .insertInto("common_variables")
      .values({
        label,
        value,
      })
      .onConflict((oc) =>
        oc.column("label").doUpdateSet({
          value: sql`EXCLUDED.value`, // Используем sql для ссылки на EXCLUDED
          updated_at: sql`CURRENT_TIMESTAMP`,
        }),
      )
      .returning("common_vars_id")
      .executeTakeFirst();

    return result?.common_vars_id ?? null;
  } catch (error) {
    throw new Error("Error upsertCommonVariable: " + error);
  }
}

export async function getCommonVariableByLabel(
  label: CommonVariablesType["label"],
  trx: poolType = pool,
): Promise<CommonVariablesType | null> {
  try {
    const result = await trx
      .selectFrom("common_variables")
      .selectAll()
      .where("label", "=", label)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getCommonVariableByLabel: " + error);
  }
}
