import logger from "../lib/logger";
import { resetImageOfOldPhotos } from "../database/queries_kysely/photos";

export async function resetMediaAfterNDays(): Promise<void> {
  try {
    await resetImageOfOldPhotos();
  } catch (error) {
    logger.error("Ошибка при обнулении медиа", error);
  }
}
