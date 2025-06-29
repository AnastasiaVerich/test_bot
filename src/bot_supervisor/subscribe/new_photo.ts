import { Bot, InputFile } from "grammy";
import { channelIdVideoSharing } from "../../config/env";
import { MyContext } from "../../bot-common/types/type";
import {
  sendPhotoMessageWithRetry,
  subscribeToChannel,
} from "../../bot-common/utils/pgNotifyUtils";
import logger from "../../lib/logger";
import { PhotosType } from "../../database/db-types";
import {
  getAllIdNewUnsentPhoto,
  getPhotoById,
  updatePhotoByPhotoId,
} from "../../database/queries_kysely/photos";

async function processRecord(
  bot: Bot<MyContext>,
  record: {
    photo_id: PhotosType["photo_id"];
  },
): Promise<void> {
  const { photo_id } = record;

  try {
    const message = photo_id.toString();
    const photo_data = await getPhotoById(photo_id);
    if (!photo_data || !photo_data.image) return;
    const inputFile = new InputFile(photo_data.image);

    const fileId = await sendPhotoMessageWithRetry(
      bot,
      message,
      channelIdVideoSharing,
      inputFile,
    );
    if (fileId !== null) {
      const res = await updatePhotoByPhotoId(photo_id, {
        is_send: true,
        file_id_supervisor: fileId,
      });
      if (!res) {
        /*logger.error(
          `Не удалось обновить messageId для записи photo_id:${photo_id}`,
        );*/
      }
    } else {
      /* logger.error(
        `Не удалось отправить сообщение для записи  photo_id:${photo_id}`,
      );*/
    }
  } catch (error) {
    logger.error(`Ошибка при обработке записи ${photo_id}:`, error);
  }
}

export async function subscribeSupervisor_newPhotoAdded(
  bot: Bot<MyContext>,
): Promise<void> {
  await subscribeToChannel(
    bot,
    "photo_added",
    getAllIdNewUnsentPhoto,
    processRecord,
  );
}
