import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { VideosType } from "../db-types";

export async function addVideo(
  fileId: VideosType["file_id"],
  videoData: VideosType["video_data"],
  fileName: VideosType["file_name"],
  mimeType: VideosType["mime_type"],
  trx: poolType = pool,
): Promise<VideosType["video_id"] | null> {
  try {
    const result = await trx
      .insertInto("videos")
      .values({
        file_id: fileId,
        video_data: videoData,
        file_name: fileName,
        mime_type: mimeType,
      })
      .returning("video_id")
      .executeTakeFirst();

    return result?.video_id ?? null;
  } catch (error) {
    throw new Error("Error addVideo: " + error);
  }
}

export async function deleteOldVideos(trx: poolType = pool): Promise<void> {
  try {
    const param =
      sql`CURRENT_TIMESTAMP - INTERVAL '30 days'` as unknown as string;
    await trx
      .deleteFrom("videos")
      .where("created_at", "<", param)
      .executeTakeFirst();
  } catch (error) {
    throw new Error("Error deleteOldVideos: " + error);
  }
}
