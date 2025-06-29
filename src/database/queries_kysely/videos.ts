import { pool, poolType } from "../dbClient";
import { VideosType } from "../db-types";

export async function addVideo(
  file_id_operator: VideosType["file_id_operator"],
  videoData: VideosType["video_data"],
  fileName: VideosType["file_name"],
  mimeType: VideosType["mime_type"],
  trx: poolType = pool,
): Promise<VideosType["video_id"] | null> {
  try {
    const result = await trx
      .insertInto("videos")
      .values({
        file_id_operator: file_id_operator,
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

export async function updateVideoByVideoId(
  video_id: VideosType["video_id"],
  params: {
    file_id_auditor?: VideosType["file_id_auditor"];
    file_id_supervisor?: VideosType["file_id_supervisor"];
  },
  trx: poolType = pool,
): Promise<VideosType["video_id"] | null> {
  try {
    const { file_id_auditor, file_id_supervisor } = params;

    if (file_id_auditor === undefined && file_id_supervisor === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} )  must be provided.`,
      );
    }
    const set: Partial<VideosType> = {};
    if (file_id_auditor !== undefined) {
      set.file_id_auditor = file_id_auditor;
    }

    if (file_id_supervisor !== undefined) {
      set.file_id_supervisor = file_id_supervisor;
    }

    const result = await trx
      .updateTable("videos")
      .set(set)
      .where("video_id", "=", video_id)
      .returning("video_id")
      .executeTakeFirst();

    return result?.video_id ?? null;
  } catch (error) {
    throw new Error("Error updateVideoByVideoId: " + error);
  }
}

export async function getVideoByVideoId(
  video_id: VideosType["video_id"],
  trx: poolType = pool,
): Promise<VideosType | null> {
  try {
    const result = await trx
      .selectFrom("videos")
      .selectAll()

      .where("video_id", "=", Number(video_id))
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getVideoByVideoId: " + error);
  }
}
