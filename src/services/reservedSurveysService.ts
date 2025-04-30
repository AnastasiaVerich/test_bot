import logger from "../lib/logger";
import {db} from "../database/dbClient";

export async function resetReservedSurveysService(): Promise<void> {

    logger.info("Запуск задачи освобождения зарезервированных опросов");
    try {
        // SQL-запрос для удаления записей, у которых reservation_end истёк
        const query = `
         UPDATE survey_active
      SET is_reservation_end = TRUE
      WHERE reservation_end < CURRENT_TIMESTAMP
      AND is_reservation_end = FALSE
      RETURNING survey_active_id, user_id, operator_id;
    `;

        // Выполняем запрос
        const result = await db.query(query);


    } catch (error) {
        let shortError = "";
        if (error instanceof Error) {
            shortError = error.message.substring(0, 50);
        } else {
            shortError = String(error).substring(0, 50);
        }
        logger.error("Error resetReservedSurveysService: " + shortError);
    }
}
