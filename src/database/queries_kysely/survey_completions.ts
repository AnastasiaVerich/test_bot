import { pool, poolType } from "../dbClient";
import { SurveyCompletionsType } from "../db-types";

export async function getSurveyCompletionsByUserId(
  userId: number,
  trx: poolType = pool,
): Promise<SurveyCompletionsType[]> {
  try {
    return await trx
      .selectFrom("survey_completions")
      .selectAll()
      .where("user_id", "=", userId)
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
    } = params;

    const result = await trx
      .insertInto("survey_completions")
      .values({
        survey_id: survey_id,
        survey_task_id: survey_task_id,
        user_id: user_id,
        operator_id: operator_id,
        reward: reward,
        result: result_main,
        result_positions_var: result_positions,
      })
      .returning("completion_id")
      .executeTakeFirst();

    return result?.completion_id ?? null;
  } catch (error) {
    throw new Error("Error addSurveyCompletion: " + error);
  }
}
