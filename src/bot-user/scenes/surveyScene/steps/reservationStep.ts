import {addSurveyInActive,} from "../../../../database/queries/surveyQueries";
import {db} from "../../../../database/dbClient";

export async function reservationStep(
  userId: number,
  operator_id: number,
  survey_id: number,
): Promise<boolean> {
  try {

    // Обновляем опрос
    await addSurveyInActive(
        survey_id,
        userId,
        operator_id,
    );
    return true;
  } catch (error) {

    return false;
  }
}
