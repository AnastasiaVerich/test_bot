import { pool, poolType } from "../dbClient";
import { AuditorSurveyActiveType } from "../db-types";

export async function addAuditSurveyActive(
  params: {
    survey_id: AuditorSurveyActiveType["survey_id"];
    auditor_id: AuditorSurveyActiveType["auditor_id"];
    video_id: AuditorSurveyActiveType["video_id"];
    task_completions_ids: AuditorSurveyActiveType["task_completions_ids"];
  },
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const { task_completions_ids, survey_id, auditor_id, video_id } = params;

    const result = await trx
      .insertInto("audit_survey_active")
      .values({
        task_completions_ids: task_completions_ids,
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

export async function getAuditSurveyActive(
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType | null> {
  try {
    const result = await trx
      .selectFrom("audit_survey_active")
      .selectAll()
      .orderBy("created_at", "asc") // Сортировка по created_at по возрастанию
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getAuditSurveyActive: " + error);
  }
}

export async function deleteAuditActiveSurvey(
  audit_survey_active_id: AuditorSurveyActiveType["audit_survey_active_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyActiveType["audit_survey_active_id"] | null> {
  try {
    const result = await trx
      .deleteFrom("audit_survey_active")
      .where("audit_survey_active_id", "=", audit_survey_active_id)
      .returning("audit_survey_active_id")
      .executeTakeFirst();

    return result?.audit_survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error deleteAuditActiveSurvey: " + error);
  }
}
