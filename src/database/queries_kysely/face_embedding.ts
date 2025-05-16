import { FaceEmbeddingsType } from "../db-types";
import { pool, poolType } from "../dbClient";

export async function getAllFaceEmbeddings(
  trx: poolType = pool,
): Promise<FaceEmbeddingsType[]> {
  try {
    const result = await trx
      .selectFrom("face_embeddings")
      .selectAll()
      .execute();

    return result;
  } catch (error) {
    throw new Error("Error getAllFaceEmbeddings: " + error);
  }
}

export async function getFaceEmbeddingByUserId(
  userId: FaceEmbeddingsType["user_id"],
  trx: poolType = pool,
): Promise<FaceEmbeddingsType | null> {
  try {
    const result = await trx
      .selectFrom("face_embeddings")
      .selectAll()
      .where("user_id", "=", userId)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getFaceEmbeddingByUserId: " + error);
  }
}

export async function addFaceEmbedding(
  userId: FaceEmbeddingsType["user_id"],
  embedding: FaceEmbeddingsType["embedding"],
  trx: poolType = pool,
): Promise<FaceEmbeddingsType["face_embedding_id"] | null> {
  try {
    const result = await trx
      .insertInto("face_embeddings")
      .values({
        user_id: userId,
        embedding,
      })
      .returning("face_embedding_id")
      .executeTakeFirst();
    return result?.face_embedding_id ?? null;
  } catch (error) {
    throw new Error("Error addFaceEmbedding: " + error);
  }
}
