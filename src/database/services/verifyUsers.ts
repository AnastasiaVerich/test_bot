import { PhotosType } from "../db-types";
import { getPhotoByUserId } from "../queries_kysely/photos";
import { getSimilarUser } from "../queries_kysely/similar_users";

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
