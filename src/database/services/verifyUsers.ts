import { PhotosType, UsersType } from "../db-types";
import { getPhotoByUserId } from "../queries_kysely/photos";
import { getSimilarUser } from "../queries_kysely/similar_users";
import { pool, poolType } from "../dbClient";

type ResultVerifyInfo = {
  users_photo: PhotosType[];
  similar_users_photo: PhotosType[][];
};
export async function getSimilarUsersPhotoByUserId(
  user_id: number,
): Promise<ResultVerifyInfo> {
  try {
    const users_photo = await getPhotoByUserId(user_id);

    let similar_users_photo: PhotosType[][] = [];

    const same_users = await getSimilarUser(user_id);

    for (const same_user of same_users) {
      const photo_same_users = await getPhotoByUserId(
        same_user.similar_user_id,
      );
      similar_users_photo.push(photo_same_users);
    }

    return {
      users_photo: users_photo,
      similar_users_photo: similar_users_photo,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error getVerifyPhotosByUserId: " + error);
  }
}

export async function getSimilarUsersWithNoSupervisorCheck(
  trx: poolType = pool,
): Promise<{ user_id: UsersType["user_id"] }[]> {
  try {
    return await trx
      .selectFrom("similar_users as su")
      .innerJoin("users as u", "su.user_id", "u.user_id")
      .select("su.user_id")
      .distinct()
      .where("u.is_supervisor_check", "=", false)
      .execute();
  } catch (error) {
    throw new Error("Error getSimilarUsersWithNoSupervisorCheck: " + error);
  }
}
