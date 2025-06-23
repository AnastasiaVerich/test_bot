import logger from "../lib/logger";
import { deleteOldPhotos } from "../database/queries_kysely/photos";
import { deleteOldVideos } from "../database/queries_kysely/videos";

export async function deleteMediaAfter30Days(): Promise<void> {
  try {
    await deleteOldPhotos();
    await deleteOldVideos();
  } catch (error) {
    logger.error("Ошибка при удалении медиа", error);
  }
}
