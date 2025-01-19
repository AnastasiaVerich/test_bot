import { QueryResult } from "pg";
import { db } from "../dbClient";

type SurveyTaskType = "live" | "photo" | "video";

interface SurveyTask {
  task_id: number;
  survey_id: number;
  description: string;
  price: number; // Сумма за задание
  task_type: SurveyTaskType;
  created_at: string; // Дата и время в ISO формате
}
type SurveyType = "animals" | "city";
type SurveyStatus = "reserved" | "available" | "in_progress";

export interface Survey {
  survey_id: number;
  region_id: number;
  reserved_by_user_id: number;
  reserved_by_operator_id: number;
  survey_type: SurveyType;
  topic: string;
  status: SurveyStatus;
  reserved_until: string | null; // Дата и время в ISO формате
  created_at: string; // Дата и время в ISO формате
  updated_at: string; // Дата и время в ISO формате
}

//Функция для нахождения недавних типов опросов
export const getRecentSurveyTypesForUser = async (
  userId: number,
  querySimilarTopicDays: number,
): Promise<SurveyType[]> => {
  try {
    const query = `
            SELECT DISTINCT s.survey_type
            FROM survey_task_user ust
            JOIN surveys s ON ust.survey_id = s.survey_id
            WHERE ust.user_id = $1 AND ust.started_at >= NOW() - $2 * INTERVAL '1 day'
        `;
    const result: QueryResult<{ survey_type: SurveyType }> = await db.query(
      query,
      [userId, querySimilarTopicDays],
    );
    return result.rows?.map((row) => row.survey_type) ?? [];
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getRecentSurveyTypesForUser: " + shortError);
  }
};

export const getExpiredReservedSurveys = async (): Promise<Survey[]> => {
  try {
    const query = `
            SELECT * FROM  surveys 
            WHERE status = 'reserved' AND reserved_until <= NOW();`;
    const result: QueryResult<Survey> = await db.query(query);

    return result.rows;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error getExpiredReservedSurveys: " + shortError);
  }
};

export const findAvailableSurvey = async (
  userId: number,
  regionId: number,
  recentSurveyTypes: string[],
): Promise<Survey | null> => {
  try {
    let query = `SELECT s.*
            FROM surveys s
            LEFT JOIN survey_task_user ust
                ON s.survey_id = ust.survey_id
                AND ust.user_id = $1
            WHERE s.region_id = $2
                AND s.status = 'available'
        `;
    if (recentSurveyTypes.length > 0) {
      const formattedRecentSurveyTypes = recentSurveyTypes
        .map((type) => `'${type}'`)
        .join(", ");
      query += ` AND s.survey_type NOT IN (${formattedRecentSurveyTypes})`; //Исключаем темы, которые уже прошел пользователь
    }

    query += ` AND ust.survey_id IS NULL`; //Проверяем, что пользователь еще не проходил этот опрос
    // Конвертируем массив тем в строку для IN-условия

    const result: QueryResult<Survey> = await db.query(query, [
      userId,
      regionId,
    ]);

    // Если найден хотя бы один опрос, возвращаем его
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error findAvailableSurvey: " + shortError);
  }
};

export const reserveSurvey = async (
  surveyId: number,
  userId: number,
  operatorId: number,
  reservationMinutes: number,
): Promise<void> => {
  try {
    const query = `
        UPDATE surveys
        SET status = 'reserved',
            reserved_by_user_id = $1,
            reserved_by_operator_id = $2,
            reserved_until = NOW() + INTERVAL '${reservationMinutes} minutes',
            updated_at = NOW()
        WHERE survey_id = $3;
    `;
    await db.query(query, [userId, operatorId, surveyId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error reserveSurvey: " + shortError);
  }
};

export const resetReserveSurvey = async (surveyId: number): Promise<void> => {
  try {
    const query = `
        UPDATE surveys
        SET status = 'available',
            reserved_by_user_id = NULL,
            reserved_by_operator_id = NULL,
            reserved_until = NULL,
            updated_at = NOW()
        WHERE survey_id = $1;
    `;
    await db.query(query, [surveyId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error resetReserveSurvey: " + shortError);
  }
};

export const inProgressSurvey = async (surveyId: number): Promise<void> => {
  try {
    const query = `
        UPDATE surveys
        SET status = 'in_progress',
            reserved_until = NULL,
            updated_at = NOW()
        WHERE survey_id = $1;
    `;
    await db.query(query, [surveyId]);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    throw new Error("Error inProgressSurvey: " + shortError);
  }
};
