import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { updateVideoByVideoId } from "../../../database/queries_kysely/videos";

export async function handleChannelPostVideo(
  ctx: MyContext,
): Promise<any | void> {
  try {
    const caption = ctx.channelPost?.caption || "0";
    const fileId = ctx.channelPost?.video?.file_id;

    await updateVideoByVideoId(Number(caption), {
      file_id_supervisor: fileId,
    });
  } catch (error) {
    logger.error("Error in handleChannelPostVideo: " + error);
  }
}
