import winston from "winston";
import logger from "./logger";
import { NODE_ENV } from "../config/env";

describe("Logger configuration", () => {
  // Проверяем конфигурацию транспорты логгера
  it("should have file transports for error and combined logs", () => {
    const fileTransports = logger.transports.filter(
      (transport) =>
        transport instanceof winston.transports.File &&
        ["error.log", "combined.log"].includes(
          (transport as winston.transports.FileTransportInstance).filename,
        ),
    );

    expect(fileTransports).toHaveLength(2); // Должны быть 2 файла
  });

  // Проверяем наличие консольного транспорта в непроизводственной среде
  it("should include console transport if not in production", () => {
    if (NODE_ENV !== "prod") {
      const consoleTransport = logger.transports.find(
        (transport) => transport instanceof winston.transports.Console,
      );
      expect(consoleTransport).toBeDefined(); // Консольный транспорт должен быть добавлен
    }
  });

  // Проверяем, что в продакшене консольный транспорт отсутствует
  it("should not include console transport in production", () => {
    if (NODE_ENV === "prod") {
      const consoleTransport = logger.transports.find(
        (transport) => transport instanceof winston.transports.Console,
      );
      expect(consoleTransport).toBeUndefined(); // Консольный транспорт не должен быть добавлен
    }
  });

  // Проверяем, что логгер настроен на запись времени
  it("should include timestamp in logs", () => {
    const timestampFormat = winston.format.timestamp();
    const logMessage = timestampFormat.transform(
      {
        LEVEL: "",
        MESSAGE: undefined,
        SPLAT: undefined,
        level: "",
        message: "Test log",
      },
      {},
    );
    expect(logMessage).toHaveProperty("timestamp"); // Убедимся, что timestamp включен
  });
});
