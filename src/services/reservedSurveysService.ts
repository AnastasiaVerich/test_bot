import logger from "../lib/logger";
import {
  getExpiredReservedSurveys,
  getSurveysTasks,
  inProgressSurvey,
  resetReserveSurvey,
  Survey,
} from "../database/queries/surveyQueries";
import { updateUserStatus } from "../database/queries/userQueries";
import { updateOperatorStatus } from "../database/queries/operatorQueries";
import { addSurveyTaskUser } from "../database/queries/surveyTaskUserQueries";

export async function resetReservedSurveysService(): Promise<void> {
  logger.info("Запуск задачи освобождения зарезервированных опросов");
  try {
    const surveys = await getExpiredReservedSurveys();
    for (let i = 0; surveys.length > i; i++) {
      await resetReserveSurvey(surveys[0].survey_id);
      await updateUserStatus(surveys[0].reserved_by_user_id, "free");
      await updateOperatorStatus(surveys[0].reserved_by_operator_id, "free");
    }
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error resetReservedSurveysService " + shortError);
  }
}

export async function inProgressSurveysService(survey: Survey): Promise<void> {
  try {
    const surveys_tasks = await getSurveysTasks(survey.survey_id);
    for (let i = 0; surveys_tasks.length > i; i++) {
      await addSurveyTaskUser(
        survey.reserved_by_user_id,
        survey.survey_id,
        surveys_tasks[i].task_id,
        0,
        "in_progress",
      );
    }
    await inProgressSurvey(survey.survey_id);
  } catch (error) {
    let shortError = "";
    if (error instanceof Error) {
      shortError = error.message.substring(0, 50);
    } else {
      shortError = String(error).substring(0, 50);
    }
    logger.error("Error inProgressSurveysService " + shortError);
  }
}
