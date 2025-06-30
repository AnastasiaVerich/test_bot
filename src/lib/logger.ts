import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import { NODE_ENV } from "../config/env";

// Настройка логгера
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    // Транспорт для ошибок с ротацией
    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m", // Максимальный размер файла — 20 МБ
      maxFiles: "14d", // Хранить логи за последние 14 дней
      zippedArchive: true, // Сжимать старые логи в архив
    }),
    // Транспорт для всех логов с ротацией
    new DailyRotateFile({
      filename: "logs/combined-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxSize: "20m", // Максимальный размер файла — 20 МБ
      maxFiles: "14d", // Хранить логи за последние 14 дней
      zippedArchive: true, // Сжимать старые логи в архив
    }),
  ],
});

// Если не в продакшене, добавляем вывод в консоль
if (NODE_ENV !== "prod") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  );
}

export default logger;
