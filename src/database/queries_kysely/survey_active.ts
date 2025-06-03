import { sql } from "kysely";
import { pool, poolType } from "../dbClient";
import { RegionSettingsType, SurveyActiveType } from "../db-types";

export async function addSurveyActive(
  params: {
    surveyId: SurveyActiveType["survey_id"];
    userId: SurveyActiveType["user_id"];
    codeWord: SurveyActiveType["code_word"];
  },
  trx: poolType = pool,
): Promise<SurveyActiveType["survey_active_id"] | null> {
  try {
    const { surveyId, userId, codeWord } = params;

    const result = await trx
      .insertInto("survey_active")
      .values({
        survey_id: surveyId,
        user_id: userId,
        operator_id: null,
        code_word: codeWord,
      })
      .returning("survey_active_id")
      .executeTakeFirst();

    return result?.survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error addSurveyActive: " + error);
  }
}

export async function isInSurveyActive(
  params: {
    userId?: SurveyActiveType["user_id"];
    operatorId?: SurveyActiveType["operator_id"];
  },
  trx: poolType = pool,
): Promise<boolean> {
  try {
    const { userId, operatorId } = params;

    if (userId === undefined && operatorId === undefined) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const query = trx
      .selectFrom("survey_active")
      .select("survey_active_id") // Выбираем минимальное поле для оптимизации
      .where((eb) => {
        const conditions = [];
        if (userId !== undefined) {
          conditions.push(eb("user_id", "=", userId));
        }
        if (operatorId !== undefined) {
          conditions.push(eb("operator_id", "=", operatorId));
        }
        return eb.or(conditions);
      })
      .limit(1);

    const result = await query.executeTakeFirst();

    return !!result;
  } catch (error) {
    throw new Error("Error isInSurveyActive: " + error);
  }
}

export async function getActiveSurvey(
  params: {
    messageId?: SurveyActiveType["message_id"];
    userId?: SurveyActiveType["user_id"];
    operatorId?: SurveyActiveType["operator_id"];
    surveyActiveId?: SurveyActiveType["survey_active_id"];
  },
  trx: poolType = pool,
): Promise<SurveyActiveType | null> {
  try {
    const { messageId, userId, operatorId, surveyActiveId } = params;

    if (
      messageId === undefined &&
      userId === undefined &&
      operatorId === undefined &&
      surveyActiveId === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} ) must be provided.`,
      );
    }

    const result = await trx
      .selectFrom("survey_active")
      .selectAll()
      .where((eb) => {
        const conditions = [];
        if (messageId !== undefined) {
          conditions.push(eb("message_id", "=", messageId));
        }
        if (userId !== undefined) {
          conditions.push(eb("user_id", "=", userId));
        }
        if (operatorId !== undefined) {
          conditions.push(eb("operator_id", "=", operatorId));
        }
        if (surveyActiveId !== undefined) {
          conditions.push(eb("survey_active_id", "=", surveyActiveId));
        }
        return eb.or(conditions);
      })
      .executeTakeFirst();
    return result ?? null;
  } catch (error) {
    throw new Error("Error getActiveSurveyByMessageId: " + error);
  }
}

export async function getAllActiveSurveysReservationByOperator(
  operatorId: SurveyActiveType["operator_id"],
  trx: poolType = pool,
): Promise<SurveyActiveType[]> {
  try {
    return await trx
      .selectFrom("survey_active")
      .selectAll()
      .where("operator_id", "=", operatorId)
      .where("reservation_end", "is not", null)
      .execute();
  } catch (error) {
    throw new Error("Error getNewActiveSurveysByOperatorId: " + error);
  }
}

export async function getAllActiveSurveysUnreservedByOperatorId(
  operatorId: number,
  trx: poolType = pool,
): Promise<SurveyActiveType[]> {
  try {
    return await trx
      .selectFrom("survey_active")
      .selectAll()
      .where("operator_id", "=", operatorId)
      .where("reservation_end", "is", null)
      .execute();
  } catch (error) {
    throw new Error(
      "Error getAllActiveSurveysUnreservedByOperatorId: " + error,
    );
  }
}

export async function updateActiveSurvey(
  surveyActiveId: SurveyActiveType["survey_active_id"],
  params: {
    messageId?: SurveyActiveType["message_id"];
    reservationMinutes?: RegionSettingsType["reservation_time_min"] | null;
    isUserNotified?: SurveyActiveType["is_user_notified"];
  },
  trx: poolType = pool,
): Promise<SurveyActiveType["survey_active_id"] | null> {
  try {
    const { messageId, reservationMinutes, isUserNotified } = params;

    if (
      messageId === undefined &&
      reservationMinutes === undefined &&
      isUserNotified === undefined
    ) {
      throw new Error(
        `At least one ( ${Object.keys(params).join(", ")} )  must be provided.`,
      );
    }

    const set: Partial<SurveyActiveType> = {};

    if (messageId !== undefined) {
      set.message_id = messageId;
    }

    if (isUserNotified !== undefined) {
      set.is_user_notified = isUserNotified;
    }

    if (reservationMinutes !== undefined) {
      if (reservationMinutes === null) {
        set.reservation_end = null;
      } else {
        set.reservation_end =
          sql<string>`CURRENT_TIMESTAMP + INTERVAL '1 minute' * ${reservationMinutes}` as unknown as string;
      }
    }

    const result = await trx
      .updateTable("survey_active")
      .set(set)
      .where("survey_active_id", "=", surveyActiveId)
      .returning("survey_active_id")
      .executeTakeFirst();

    return result?.survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error updateActiveSurveyMessageId: " + error);
  }
}

export async function setActiveSurveyOperatorIdIfNull(
  surveyActiveId: SurveyActiveType["survey_active_id"],
  operatorId: SurveyActiveType["operator_id"],
  trx: poolType = pool,
): Promise<SurveyActiveType["survey_active_id"] | null> {
  try {
    const result = await trx
      .updateTable("survey_active")
      .set({ operator_id: operatorId })
      .where("survey_active_id", "=", surveyActiveId)
      .where("operator_id", "is", null)
      .returning("survey_active_id")
      .executeTakeFirst();
    return result?.survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error setActiveSurveyOperatorIdIfNull: " + error);
  }
}

export async function deleteActiveSurvey(
  survey_active_id: SurveyActiveType["survey_active_id"],
  trx: poolType = pool,
): Promise<SurveyActiveType["survey_active_id"] | null> {
  try {
    const result = await trx
      .deleteFrom("survey_active")
      .where("survey_active_id", "=", survey_active_id)
      .returning("survey_active_id")
      .executeTakeFirst();

    return result?.survey_active_id ?? null;
  } catch (error) {
    throw new Error("Error deleteActiveSurvey: " + error);
  }
}
