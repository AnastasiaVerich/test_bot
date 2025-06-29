import logger from "../../lib/logger";
import { entitiesType, MyContext } from "../types/type";
import { updatePhotoFileId } from "../../database/services/media";

export async function handleChannelPostPhoto(
  ctx: MyContext,
  role: entitiesType,
): Promise<any | void> {
  try {
    const caption = ctx.channelPost?.caption || "0";
    const fileId = ctx.channelPost?.photo?.[0].file_id;

    if (fileId) {
      await updatePhotoFileId(Number(caption), fileId, role);
    }
  } catch (error) {
    logger.error("Error in handleChannelPostPhoto: " + error);
  }
}
