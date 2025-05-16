import { pool, poolType } from "../dbClient";
import { PhotosType } from "../db-types";

export async function addPhoto(
  userId: PhotosType["user_id"],
  image: PhotosType["image"],
  trx: poolType = pool,
): Promise<PhotosType["photo_id"] | null> {
  try {
    const result = await trx
      .insertInto("photos")
      .values({
        user_id: userId,
        image: image,
      })
      .returning("photo_id")
      .executeTakeFirst();

    return result?.photo_id ?? null;
  } catch (error) {
    throw new Error("Error addPhoto: " + error);
  }
}
