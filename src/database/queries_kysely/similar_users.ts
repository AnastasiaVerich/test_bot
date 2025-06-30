import { pool, poolType } from "../dbClient";
import { SimilarUserstType } from "../db-types";

export async function addSimilarUser(
  user_id: SimilarUserstType["user_id"],
  similar_user_id: SimilarUserstType["similar_user_id"],
  trx: poolType = pool,
): Promise<void> {
  try {
    // Проверяем, что user_id и similar_user_id разные
    if (user_id === similar_user_id) {
      throw new Error("User cannot be similar to themselves");
    }

    // Добавляем обе записи для двунаправленной связи
    await trx
      .insertInto("similar_users")
      .values([
        { user_id: user_id, similar_user_id: similar_user_id },
        { user_id: similar_user_id, similar_user_id: user_id },
      ])
      // Игнорируем дубликаты, если связь уже существует
      .onConflict((oc) => oc.constraint("similar_users_pkey").doNothing())
      .execute();
  } catch (error) {
    throw new Error("Error addSimilarUser: " + error);
  }
}

export async function getSimilarUser(
  user_id: SimilarUserstType["user_id"],
  trx: poolType = pool,
): Promise<SimilarUserstType[]> {
  try {
    // Добавляем обе записи для двунаправленной связи
    const result = await trx
      .selectFrom("similar_users")
      .selectAll()
      .where("user_id", "=", user_id)
      .execute();
    return result;
  } catch (error) {
    throw new Error("Error addSimilarUser: " + error);
  }
}
