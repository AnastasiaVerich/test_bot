import schedule from "node-schedule";
import { resetReservedSurveysService } from "../services/reservedSurveysService";

// Запускаем задачу каждые 1 минуту по очистке резервации опросов
schedule.scheduleJob("*/1 * * * *", resetReservedSurveysService);
