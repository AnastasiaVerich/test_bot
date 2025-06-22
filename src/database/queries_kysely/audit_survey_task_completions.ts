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
      })
      .returning("id")
      .executeTakeFirst();

    return res?.id ?? null;
  } catch (error) {
    throw new Error("Error addAuditSurveyActive: " + error);
  }
}
