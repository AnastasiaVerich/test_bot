import { pool, poolType } from "../dbClient";
import { SurveyTasksType } from "../db-types";

export async function getAllSurveyTasks(
  surveyId: number,
  trx: poolType = pool,
): Promise<SurveyTasksType[]> {
  try {
    return await trx
      .selectFrom("survey_tasks")
      .selectAll()
      .where("survey_id", "=", surveyId)
      .execute();
  } catch (error) {
    throw new Error("Error getAllSurveyTasks: " + error);
  }
}

export async function addSurveyTask(
  params: {
    surveyId: SurveyTasksType["survey_id"];
    description: SurveyTasksType["description"];
    data: SurveyTasksType["data"];
  },
  trx: poolType = pool,
): Promise<SurveyTasksType["survey_task_id"] | null> {
  try {
    const { surveyId, description, data } = params;

    const result = await trx
      .insertInto("survey_tasks")
      .values({
        survey_id: surveyId,
        description: description,
        data: data,
      })
      .returning("survey_task_id")
      .executeTakeFirst();

    return result?.survey_task_id ?? null;
  } catch (error) {
    throw new Error("Error addSurveyTask: " + error);
  }
}
