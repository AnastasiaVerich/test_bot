import { pool, poolType } from "../dbClient";
import { AuditorSurveyTaskCompletionsType } from "../db-types";

export async function addAuditSurveyTaskCompletions(
  params: {
    completion_id: AuditorSurveyTaskCompletionsType["completion_id"];
    auditor_id: AuditorSurveyTaskCompletionsType["auditor_id"];
    result: AuditorSurveyTaskCompletionsType["result"];
    result_positions_var: AuditorSurveyTaskCompletionsType["result_positions_var"];
    reward_auditor: AuditorSurveyTaskCompletionsType["reward_auditor"];
    description: AuditorSurveyTaskCompletionsType["description"];
    survey_task_id: AuditorSurveyTaskCompletionsType["survey_task_id"];
    survey_id: AuditorSurveyTaskCompletionsType["survey_id"];
  },
  trx: poolType = pool,
): Promise<AuditorSurveyTaskCompletionsType["id"] | null> {
  try {
    const {
      completion_id,
      auditor_id,
      result,
      result_positions_var,
      reward_auditor,
      description,
      survey_task_id,
      survey_id,
    } = params;

    const res = await trx
      .insertInto("audit_survey_task_completions")
      .values({
        completion_id: completion_id,
        auditor_id: auditor_id,
        result: result,
        result_positions_var: result_positions_var,
        reward_auditor: reward_auditor,
        description: description,
        survey_task_id: survey_task_id,
        survey_id: survey_id,
      })
      .returning("id")
      .executeTakeFirst();

    return res?.id ?? null;
  } catch (error) {
    throw new Error("Error addAuditSurveyTaskCompletions: " + error);
  }
}

export async function getAuditSurveyCompletionsByAuditorId(
  auditor_id: AuditorSurveyTaskCompletionsType["auditor_id"],
  trx: poolType = pool,
): Promise<AuditorSurveyTaskCompletionsType[]> {
  try {
    return await trx
      .selectFrom("audit_survey_task_completions")
      .selectAll()
      .where("auditor_id", "=", auditor_id)
      .orderBy("created_at", "desc")
      .execute();
  } catch (error) {
    throw new Error("Error getAuditSurveyCompletionsByAuditorId: " + error);
  }
}

export async function getAuditSurveyCompletionsById(
  id: AuditorSurveyTaskCompletionsType["id"],
  trx: poolType = pool,
): Promise<AuditorSurveyTaskCompletionsType | null> {
  try {
    const result = await trx
      .selectFrom("audit_survey_task_completions")
      .selectAll()
      .where("id", "=", id)
      .orderBy("created_at", "desc")
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getAuditSurveyCompletionsById: " + error);
  }
}
