import { pool, poolType } from "../dbClient";
import { SurveyCompletionsType } from "../db-types";

export async function getSurveyCompletionsById(
  params: {
    user_id?: SurveyCompletionsType["user_id"];
    operator_id?: SurveyCompletionsType["operator_id"];
  },
  trx: poolType = pool,
): Promise<SurveyCompletionsType[]> {
  try {
    const { user_id = null, operator_id = null } = params;

    return await trx
      .selectFrom("survey_task_completions")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (user_id !== undefined) {
          conditions.push(eb("user_id", "=", user_id));
        }
        if (operator_id !== undefined) {
          conditions.push(eb("operator_id", "=", operator_id));
        }

        return eb.or(conditions);
      })
      .orderBy("completed_at", "desc")
      .execute();
  } catch (error) {
    throw new Error("Error getSurveyCompletionsByd: " + error);
  }
}

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
    throw new Error("Error getSurveyCompletionsByOperatorId: " + error);
  }
}

export async function getSurveyTaskCompletionByCompletionId(
  completion_id: SurveyCompletionsType["completion_id"],
  trx: poolType = pool,
): Promise<SurveyCompletionsType | null> {
  try {
    const result = await trx
      .selectFrom("survey_task_completions")
      .selectAll()
      .where("completion_id", "=", completion_id)
      .orderBy("completed_at", "desc")
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getSurveyTaskCompletionByCompletionId: " + error);
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
    reward_user: SurveyCompletionsType["reward_user"];
    reward_operator: SurveyCompletionsType["reward_operator"];
    video_id: SurveyCompletionsType["video_id"];
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
      reward_user,
      reward_operator,
      video_id,
    } = params;

    const result = await trx
      .insertInto("survey_task_completions")
      .values({
        survey_id: survey_id,
        survey_task_id: survey_task_id,
        user_id: user_id,
        operator_id: operator_id,
        reward_user: reward_user,
        result: result_main,
        result_positions_var: result_positions,
        reward_operator: reward_operator,
        video_id: video_id,
      })
      .returning("completion_id")
      .executeTakeFirst();

    return result?.completion_id ?? null;
  } catch (error) {
    throw new Error("Error addSurveyCompletion: " + error);
  }
}

export async function updateSurveyCompletion(
  completion_id: SurveyCompletionsType["completion_id"],
  params: {
    result_main?: SurveyCompletionsType["result"];
    result_positions?: SurveyCompletionsType["result_positions_var"];
    reward_user?: SurveyCompletionsType["reward_user"];
    reward_operator?: SurveyCompletionsType["reward_operator"];
    is_valid?: SurveyCompletionsType["is_valid"];
  },
  trx: poolType = pool,
): Promise<SurveyCompletionsType["completion_id"] | null> {
  try {
    const {
      reward_user,
      result_main,
      result_positions,
      reward_operator,
      is_valid,
    } = params;

    const set: Partial<SurveyCompletionsType> = {};

    if (reward_user !== undefined) {
      set.reward_user = reward_user;
    }
    if (reward_operator !== undefined) {
      set.reward_operator = reward_operator;
    }
    if (is_valid !== undefined) {
      set.is_valid = is_valid;
    }
    if (result_main !== undefined) {
      set.result = result_main;
    }
    if (result_positions !== undefined) {
      set.result_positions_var = result_positions;
    }

    const result = await trx
      .updateTable("survey_task_completions")
      .set(set)
      .where("completion_id", "=", completion_id)

      .returning("completion_id")
      .executeTakeFirst();

    return result?.completion_id ?? null;
  } catch (error) {
    throw new Error("Error updateSurveyCompletion: " + error);
  }
}

export async function deleteSurveyCompletion(
  completion_id: SurveyCompletionsType["completion_id"],
  trx: poolType = pool,
): Promise<SurveyCompletionsType["completion_id"] | null> {
  try {
    const result = await trx
      .deleteFrom("survey_task_completions")
      .where("completion_id", "=", completion_id)
      .returning("completion_id")
      .executeTakeFirst();

    return result?.completion_id ?? null;
  } catch (error) {
    throw new Error("Error deleteSurveyCompletion: " + error);
  }
}
