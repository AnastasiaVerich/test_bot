import schedule from "node-schedule";
import { checkAndUpdateSurveyStatus } from "../../database/queries/surveyQueries";

// Запускаем задачу каждые 10 минут по очистке резервации опросов
schedule.scheduleJob("*/10 * * * *", checkAndUpdateSurveyStatus);
