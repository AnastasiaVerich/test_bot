import { pool, poolType } from "../dbClient";
import { SurveyCompletionsType } from "../db-types";

export async function getSurveyCompletionsByUserId(
  userId: SurveyCompletionsType["user_id"],
  trx: poolType = pool,
): Promise<SurveyCompletionsType[]> {
  try {
    return await trx
      .selectFrom("survey_task_completions")
      .selectAll()
      .where("user_id", "=", userId)
      .orderBy("completed_at", "desc")
      .execute();
  } catch (error) {
    throw new Error("Error getSurveyCompletionsByUserId: " + error);
  }
}

export async function getSurveyCompletionsByOperatorId(
  operatorId: SurveyCompletionsType["operator_id"],
  trx: poolType = pool,
): Promise<SurveyCompletionsType[]> {
  try {
    return await trx
      .selectFrom("survey_task_completions")
      .selectAll()
      .where("operator_id", "=", operatorId)
      .orderBy("completed_at", "desc")
      .execute();
  } catch (error) {
    throw new Error("Error getSurveyCompletionsByUserId: " + error);
  }
}

export async function addSurveyCompletion(
  params: {
    survey_id: SurveyCompletionsType["survey_id"];
    survey_task_id: SurveyCompletionsType["survey_task_id"];
    user_id: SurveyCompletionsType["user_id"];
    operator_id: SurveyCompletionsType["operator_id"];
    result_main: SurveyCompletionsType["result"];
    result_positions: SurveyCompletionsType["result_positions_var"];
    reward: SurveyCompletionsType["reward"];
    reward_operator: SurveyCompletionsType["reward_operator"];
    video_id: SurveyCompletionsType["video_id"];
    survey_active_id: SurveyCompletionsType["survey_active_id"];
  },
  trx: poolType = pool,
): Promise<SurveyCompletionsType["completion_id"] | null> {
  try {
    const {
      survey_id,
      survey_task_id,
      user_id,
      operator_id,
      result_main,
      result_positions,
      reward,
      reward_operator,
      video_id,
      survey_active_id,
    } = params;

    const result = await trx
      .insertInto("survey_task_completions")
      .values({
        survey_id: survey_id,
        survey_task_id: survey_task_id,
        user_id: user_id,
        operator_id: operator_id,
        reward: reward,
        result: result_main,
        result_positions_var: result_positions,
        reward_operator: reward_operator,
        video_id: video_id,
        survey_active_id: survey_active_id,
      })
      .returning("completion_id")
      .executeTakeFirst();

    return result?.completion_id ?? null;
  } catch (error) {
    throw new Error("Error addSurveyCompletion: " + error);
  }
}
