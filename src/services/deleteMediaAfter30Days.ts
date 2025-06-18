import logger from "../lib/logger";
import { deleteOldPhotos } from "../database/queries_kysely/photos";

export async function deleteMediaAfter30Days(): Promise<void> {
  try {
    await deleteOldPhotos();
  } catch (error) {
    logger.error("Ошибка при удалении медиа", error);
  }
}
