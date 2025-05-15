import logger from "../lib/logger";
import {db} from "../database/dbClient";

export async function resetReservedSurveysService(): Promise<void> {

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

        logger.error("Error resetReservedSurveysService: " + error);
    }
}
