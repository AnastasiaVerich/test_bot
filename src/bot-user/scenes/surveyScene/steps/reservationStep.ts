import {
  Operator,
  updateOperatorStatus,
} from "../../../../database/queries/operatorQueries";
import {
  reserveSurvey,
  Survey,
} from "../../../../database/queries/surveyQueries";
import { RegionSettings } from "../../../../database/queries/regionQueries";
import { db } from "../../../../database/dbClient";
import { updateUserStatus } from "../../../../database/queries/userQueries";
import logger from "../../../../lib/logger";

export async function reservationStep(
  userId: number,
  operator: Operator,
  survey: Survey,
  region: RegionSettings,
): Promise<boolean> {
  // Обновляем статус пользователя
  const client = await db.connect(); // Получение соединения с базой данных
  try {
    await client.query("BEGIN"); // Начинаем транзакцию

    await updateUserStatus(userId, "busy");

    // Обновляем статус оператора
    await updateOperatorStatus(operator.operator_id, "busy");

    // Обновляем опрос
    await reserveSurvey(
      survey.survey_id,
      userId,
      operator.operator_id,
      region.reservation_time_min,
    );
    await client.query("COMMIT"); // Фиксируем транзакцию
    return true;
  } catch (error) {
    logger.error(error);

    await client.query("ROLLBACK"); // Откатываем транзакцию в случае ошибки
    return false;
  } finally {
    client.release(); // Освобождаем клиента
  }
}
