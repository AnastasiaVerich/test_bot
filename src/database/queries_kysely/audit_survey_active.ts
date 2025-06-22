import { pool, poolType } from "../dbClient";
import { AuditorSurveyActiveType } from "../db-types";

export async function addAuditSurveyActive(
  params: {
    survey_active_id: AuditorSurveyActiveType["survey_active_id"];
    survey_id: AuditorSurveyActiveType["survey_id"];
    auditor_id: AuditorSurveyActiveType["auditor_id"];
    video_id: AuditorSurveyActiveType["video_id"];
  },
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["survey_active_id"] | null> {
  try {
    const { survey_active_id, survey_id, auditor_id, video_id } = params;

    const result = await trx
      .insertInto("audit_survey_active")
      .values({
        survey_active_id: survey_active_id,
        survey_id: survey_id,
        auditor_id: auditor_id,
        video_id: video_id,
      })
      .returning("audit_survey_active_id")
      .executeTakeFirst();

    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error addAuditSurveyActive: " + error);
  }
}
