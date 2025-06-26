import { pool, poolType } from "../dbClient";
import { RecheckSurveyType } from "../db-types";

export async function addRecheckSurvey(
  params: {
    survey_id: RecheckSurveyType["survey_id"];
    operator_id: RecheckSurveyType["operator_id"];
    user_id: RecheckSurveyType["user_id"];
    video_id: RecheckSurveyType["video_id"];
    audit_task_ids: RecheckSurveyType["audit_task_ids"];
  },
  trx: poolType = pool,
): Promise<RecheckSurveyType["recheck_survey_id"] | null> {
  try {
    const { audit_task_ids, survey_id, operator_id, user_id, video_id } =
      params;

    const result = await trx
      .insertInto("recheck_survey")
      .values({
        survey_id: survey_id,
        video_id: video_id,
        operator_id: operator_id,
        user_id: user_id,
        audit_task_ids: audit_task_ids,
      })
      .returning("recheck_survey_id")
      .executeTakeFirst();

    return result?.recheck_survey_id ?? null;
  } catch (error) {
    throw new Error("Error addRecheckSurvey: " + error);
  }
}

export async function getAllRecheckSurveyByOperatorId(
  operator_id: RecheckSurveyType["operator_id"],
  trx: poolType = pool,
): Promise<RecheckSurveyType[]> {
  try {
    const result = await trx
      .selectFrom("recheck_survey")
      .selectAll()
      .where("operator_id", "=", operator_id)
      .execute();
    return result;
  } catch (error) {
    throw new Error("Error getRecheckSurveyByOperatorId: " + error);
  }
}

export async function getRecheckSurveyByRecheckId(
  recheck_survey_id: RecheckSurveyType["recheck_survey_id"],
  trx: poolType = pool,
): Promise<RecheckSurveyType | null> {
  try {
    const result = await trx
      .selectFrom("recheck_survey")
      .selectAll()
      .where("recheck_survey_id", "=", recheck_survey_id)
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getRecheckSurveyByRecheckId: " + error);
  }
}

export async function deleteRecheckSurvey(
  recheck_survey_id: RecheckSurveyType["recheck_survey_id"],
  trx: poolType = pool,
): Promise<RecheckSurveyType["recheck_survey_id"] | null> {
  try {
    const result = await trx
      .deleteFrom("recheck_survey")
      .where("recheck_survey_id", "=", recheck_survey_id)
      .returning("recheck_survey_id")
      .executeTakeFirst();

    return result?.recheck_survey_id ?? null;
  } catch (error) {
    throw new Error("Error deleteActiveSurvey: " + error);
  }
}
