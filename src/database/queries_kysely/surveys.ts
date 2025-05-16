import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { SurveysType } from "../db-types";

export async function addSurvey(
  params: {
    regionId: SurveysType["region_id"];
    surveyType: SurveysType["survey_type"];
    topic: SurveysType["topic"];
    description: SurveysType["description"];
    completionLimit: SurveysType["completion_limit"];
    taskPrice: SurveysType["task_price"];
  },
  trx: poolType = pool,
): Promise<SurveysType["survey_id"] | null> {
  try {
    const {
      regionId,
      surveyType,
      topic,
      description,
      completionLimit,
      taskPrice,
    } = params;

    const result = await trx
      .insertInto("surveys")
      .values({
        region_id: regionId,
        survey_type: surveyType,
        topic: topic,
        description: description,
        completion_limit: completionLimit,
        task_price: taskPrice,
      })
      .returning("survey_id")
      .executeTakeFirst();

    return result?.survey_id ?? null;
  } catch (error) {
    throw new Error("Error addSurvey: " + error);
  }
}

export async function getLeastCompletedSurveyForRegion(
  regionId: SurveysType["region_id"],
  trx: poolType = pool,
): Promise<SurveysType | null> {
  try {
    const result = await trx
      .selectFrom("surveys")
      .selectAll()
      .where("region_id", "=", regionId)
      .where(
        (eb) =>
          eb("completion_limit", "-", eb.ref("active_and_completed_count")),
        ">",
        0,
      )
      .orderBy("active_and_completed_count", "asc")
      .limit(1)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getLeastCompletedSurveyForRegion: " + error);
  }
}

export async function getLeastCompletedSurvey(
  trx: poolType = pool,
): Promise<SurveysType | null> {
  try {
    const result = await trx
      .selectFrom("surveys")
      .selectAll()
      .where(
        (eb) =>
          eb("completion_limit", "-", eb.ref("active_and_completed_count")),
        ">",
        0,
      )
      .orderBy("active_and_completed_count", "asc")
      .limit(1)
      .executeTakeFirst();

    return result ?? null;
  } catch (error) {
    throw new Error("Error getLeastCompletedSurvey: " + error);
  }
}

export async function getSurveyById(
  surveyId: SurveysType["survey_id"],
  trx: poolType = pool,
): Promise<SurveysType | undefined> {
  try {
    const result = await trx
      .selectFrom("surveys")
      .selectAll()
      .where("survey_id", "=", surveyId)
      .executeTakeFirst();

    return result;
  } catch (error) {
    throw new Error("Error getSurveyById: " + error);
  }
}

export async function updateSurvey(
  surveyId: SurveysType["survey_id"],
  params: {
    increment_count?: number;
    decrement_count?: number;
  },
  trx: poolType = pool,
): Promise<SurveysType["survey_id"] | null> {
  try {
    const { increment_count, decrement_count } = params;

    if (increment_count === undefined && decrement_count === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} )  must be provided.`,
      );
    }

    const set: Partial<SurveysType> = {};

    if (increment_count !== undefined) {
      set.active_and_completed_count =
        sql<number>`active_and_completed_count + ${increment_count}` as unknown as number;
    }

    if (decrement_count !== undefined) {
      set.active_and_completed_count =
        sql<number>`active_and_completed_count - ${decrement_count}` as unknown as number;
    }

    const result = await trx
      .updateTable("surveys")
      .set(set)
      .where("survey_id", "=", surveyId)
      .returning("survey_id")
      .executeTakeFirst();

    return result?.survey_id ?? null;
  } catch (error) {
    throw new Error("Error updateSurvey: " + error);
  }
}
