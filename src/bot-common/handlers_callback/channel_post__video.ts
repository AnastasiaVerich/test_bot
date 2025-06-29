import logger from "../../lib/logger";
import { entitiesType, MyContext } from "../types/type";
import { updateVideoFileId } from "../../database/services/media";

export async function handleChannelPostVideo(
  ctx: MyContext,
  role: entitiesType,
): Promise<any | void> {
  try {
    const caption = ctx.channelPost?.caption || "0";
    const fileId = ctx.channelPost?.video?.file_id;

    if (fileId) {
      await updateVideoFileId(Number(caption), fileId, role);
    }
  } catch (error) {
    logger.error("Error in handleChannelPostVideo: " + error);
  }
}
