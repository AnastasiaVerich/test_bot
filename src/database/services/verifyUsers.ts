import { PhotosType } from "../db-types";
import { getUser } from "../queries_kysely/users";
import { getPhotoByUserId } from "../queries_kysely/photos";
import { getAllUserSamePhotoLogsByUserId } from "../queries_kysely/bot_user_logs";

type ResultVerifyInfo = {
  isRegister: boolean;
  photo_users: PhotosType[];
  same_users_photo: PhotosType[][];
};
export async function getVerifyPhotosByUserId(
  user_id: number,
): Promise<ResultVerifyInfo> {
  try {
    const isRegister = await getUser({ user_id: user_id });
    if (!isRegister) {
      return {
        isRegister: false,
        photo_users: [],
        same_users_photo: [],
      };
    }
    const photo_users = await getPhotoByUserId(user_id);

    let same_users_photo: PhotosType[][] = [];
    const same_users_logs = await getAllUserSamePhotoLogsByUserId(user_id);
    for (const same_users_log of same_users_logs) {
      const same_users = same_users_log.event_data;
      for (const same_user of same_users) {
        const photo_users = await getPhotoByUserId(same_user.user_id);
        same_users_photo.push(photo_users);
      }
    }
    return {
      isRegister: true,
      photo_users: photo_users,
      same_users_photo: same_users_photo,
    };
  } catch (error) {
    console.log(error);
    throw new Error("Error getVerifyPhotosByUserId: " + error);
  }
}
