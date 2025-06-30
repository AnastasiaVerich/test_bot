import { sql } from "kysely";
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
    console.log(error);
    throw new Error("Error addPhoto: " + error);
  }
}

export async function updatePhotoByPhotoId(
  photo_id: PhotosType["photo_id"],
  params: {
    file_id_auditor?: PhotosType["file_id_auditor"];
    file_id_supervisor?: PhotosType["file_id_supervisor"];
    file_id_operator?: PhotosType["file_id_operator"];
    is_send?: PhotosType["is_send"];
    image?: PhotosType["image"];
  },
  trx: poolType = pool,
): Promise<PhotosType["photo_id"] | null> {
  try {
    const {
      file_id_auditor,
      file_id_supervisor,
      file_id_operator,
      is_send,
      image,
    } = params;

    if (
      file_id_auditor === undefined &&
      file_id_supervisor === undefined &&
      file_id_operator === undefined &&
      image === undefined &&
      is_send === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} )  must be provided.`,
      );
    }
    const set: Partial<PhotosType> = {};
    if (file_id_auditor !== undefined) {
      set.file_id_auditor = file_id_auditor;
    }

    if (file_id_supervisor !== undefined) {
      set.file_id_supervisor = file_id_supervisor;
    }

    if (file_id_operator !== undefined) {
      set.file_id_operator = file_id_operator;
    }
    if (is_send !== undefined) {
      set.is_send = is_send;
    }
    if (image !== undefined) {
      set.image = image;
    }

    const result = await trx
      .updateTable("photos")
      .set(set)
      .where("photo_id", "=", photo_id)
      .returning("photo_id")
      .executeTakeFirst();

    return result?.photo_id ?? null;
  } catch (error) {
    throw new Error("Error updatePhotoByPhotoId: " + error);
  }
}

export async function getAllIdNewUnsentPhoto(trx: poolType = pool): Promise<
  {
    photo_id: PhotosType["photo_id"];
  }[]
> {
  try {
    return await trx
      .selectFrom("photos")
      .select("photo_id")
      .where("is_send", "is", false)
      .execute();
  } catch (error) {
    throw new Error("Error getAllIdNewUnsentPhoto: " + error);
  }
}

export async function getPhotoById(
  photo_id: PhotosType["photo_id"],
  trx: poolType = pool,
): Promise<PhotosType | null> {
  try {
    const result = await trx
      .selectFrom("photos")
      .selectAll()
      .where("photo_id", "=", photo_id)
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getPhotoById: " + error);
  }
}

export async function getPhotoByUserId(
  user_id: PhotosType["user_id"],
  trx: poolType = pool,
): Promise<PhotosType[]> {
  try {
    return await trx
      .selectFrom("photos")
      .selectAll()
      .where("user_id", "=", user_id)
      .orderBy("created_at", "asc")
      .execute();
  } catch (error) {
    throw new Error("Error getPhotoByUserId: " + error);
  }
}

export async function resetImageOfOldPhotos(
  trx: poolType = pool,
): Promise<void> {
  try {
    const param =
      sql`CURRENT_TIMESTAMP - INTERVAL '1 days'` as unknown as string;
    await trx
      .updateTable("photos")
      .set({ image: null })
      .where("created_at", "<", param)
      .where("file_id_operator", "is not", null)
      .where("file_id_auditor", "is not", null)
      .where("file_id_supervisor", "is not", null)
      .execute();
  } catch (error) {
    throw new Error("Error resetImageOldPhotos: " + error);
  }
}
