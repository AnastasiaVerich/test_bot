import { entitiesType } from "../../bot-common/types/type";
import { updatePhotoByPhotoId } from "../queries_kysely/photos";
import { updateVideoByVideoId } from "../queries_kysely/videos";

export async function updatePhotoFileId(
  id: number,
  file_id: string,
  type: entitiesType,
) {
  switch (type) {
    case "auditor":
      await updatePhotoByPhotoId(id, {
        file_id_auditor: file_id,
      });

      break;
    case "operator":
      await updatePhotoByPhotoId(id, {
        file_id_operator: file_id,
      });

      break;
    case "supervisor":
      await updatePhotoByPhotoId(id, { file_id_supervisor: file_id });
      break;
  }
}

export async function updateVideoFileId(
  id: number,
  file_id: string,
  type: entitiesType,
) {
  switch (type) {
    case "auditor":
      await updateVideoByVideoId(id, {
        file_id_auditor: file_id,
      });

      break;
    case "supervisor":
      await updateVideoByVideoId(id, { file_id_supervisor: file_id });
      break;
  }
}
