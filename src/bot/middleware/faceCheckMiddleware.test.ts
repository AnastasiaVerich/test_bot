import { Conversation } from "@grammyjs/conversations";
import { faceCheckMiddleware } from "./faceCheckMiddleware"; // Путь к вашей функции
import { MyContext } from "../types/type";
import { WEB_APP_URL } from "../../config/env";
import { MESSAGES } from "../constants/messages";
import { updateUserLastInit } from "../../database/queries/userQueries";
import { getUserId } from "../utils/getUserId";
import { BUTTONS_KEYBOARD } from "../constants/button";
import logger from "../../lib/logger";

// Мокаем зависимости
jest.mock("../../database/queries/userQueries");
jest.mock("../utils/getUserId");
jest.mock("../../lib/logger");

describe("Test faceCheckMiddleware", () => {
  let ctx: Partial<MyContext>;
  const conversation: Partial<Conversation<MyContext>> = {
    waitFor: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      reply: jest.fn(),
    };
  });

  // Проверяет, кейс успешного выолнения
  it("should send message with photo verification and WebApp button", async () => {
    (getUserId as jest.Mock).mockResolvedValue(12345);

    const webAppData = {
      message: { web_app_data: { data: '{"text": "success"}' } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await faceCheckMiddleware(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    // Проверяем, что был вызван метод reply с правильным текстом и кнопкой

    expect(ctx.reply).toHaveBeenCalledWith(
      MESSAGES.VERIFY_BY_PHOTO,
      expect.objectContaining({
        reply_markup: {
          keyboard: [
            [
              {
                text: BUTTONS_KEYBOARD.OpenAppButton,
                web_app: expect.objectContaining({
                  url: `${WEB_APP_URL}?data=${encodeURIComponent(
                    JSON.stringify({
                      userId: 12345,
                      type: "identification",
                      isSavePhoto: "0",
                    }),
                  )}`,
                }),
              },
            ],
          ],
          resize_keyboard: expect.any(Boolean),
        },
      }),
    );

    // Проверяем, что вернулось правильное состояние
    expect(result?.isSuccess).toBe(true);
    expect(result?.text).toBe("success");

    // Проверяем, что updateUserLastInit был вызван
    expect(updateUserLastInit).toHaveBeenCalledWith(12345);
  });

  // Проверяет, что возвращается неудача, если данные WebApp содержат ошибку
  it("should return failure if web app data is not success", async () => {
    (getUserId as jest.Mock).mockResolvedValue(12345);

    const webAppData = {
      message: { web_app_data: { data: '{"text": "failed"}' } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await faceCheckMiddleware(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    // Проверяем, что вернулось состояние неуспеха
    expect(result?.isSuccess).toBe(false);
    expect(result?.text).toBe("failed");

    // Проверяем, что updateUserLastInit не был вызван
    expect(updateUserLastInit).not.toHaveBeenCalled();
  });

  // Проверяет, что выполнение функции останавливается, если не найден userId
  it("should return failure if no userId found", async () => {
    (getUserId as jest.Mock).mockResolvedValue(null);

    const result = await faceCheckMiddleware(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    expect(result?.isSuccess).toBe(false);
    expect(result?.text).toBe("server_error");

    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что ошибки обрабатываются корректно и функция возвращает сообщение об ошибке
  it("should handle errors gracefully", async () => {
    const error = new Error("Test error");
    (getUserId as jest.Mock).mockRejectedValue(error); // Мокаем ошибку в getUserId

    await faceCheckMiddleware(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
    expect(logger.error).toHaveBeenCalledWith(
      "Error faceCheckMiddleware:",
      error,
    );
  });
});
