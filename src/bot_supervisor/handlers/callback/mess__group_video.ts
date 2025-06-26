import { MyContext } from "../../../bot-common/types/type";
import logger from "../../../lib/logger";
import { updateVideoByVideoId } from "../../../database/queries_kysely/videos";

export async function handleGroupVideo(ctx: MyContext): Promise<any | void> {
  try {
    const caption = ctx.channelPost?.caption || "0";
    const fileId = ctx.channelPost?.video?.file_id;
    console.log("Подпись:", caption);
    console.log("File ID (видео):", fileId);
    await updateVideoByVideoId(Number(caption), {
      file_id_supervisor: fileId,
    });
  } catch (error) {
    logger.error("Error in handleGroupVideo: " + error);
  }
}
