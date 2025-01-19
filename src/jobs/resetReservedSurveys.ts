import schedule from "node-schedule";
import { resetReservedSurveysService } from "../services/reservedSurveysService";

// Запускаем задачу каждые 10 минут по очистке резервации опросов
schedule.scheduleJob("*/1 * * * *", resetReservedSurveysService);
