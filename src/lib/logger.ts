import winston from "winston";
import { NODE_ENV } from "../config/env";

// Настройка логгера
const logger = winston.createLogger({
  level: "info", // Уровень логирования: debug, info, warn, error
  format: winston.format.combine(
    winston.format.timestamp(), // Добавление времени
    winston.format.json(), // Формат JSON
  ),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }), // Логи ошибок
    new winston.transports.File({ filename: "combined.log" }), // Все логи
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
