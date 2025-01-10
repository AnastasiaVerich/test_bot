import { authMiddleware } from "./authMiddleware";
import { findUserByTelegramId } from "../../database/queries/userQueries";
import { getUserId } from "../utils/getUserId";
import { MESSAGES } from "../constants/messages";
import logger from "../../lib/logger";
import { MyContext } from "../types/type";

jest.mock("../../database/queries/userQueries");
jest.mock("../utils/getUserId");
jest.mock("../../lib/logger");

describe("Test authMiddleware", () => {
  let ctx: Partial<MyContext>;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      reply: jest.fn(),
    };
  });

  // Проверяет, что next вызывается, если пользователь авторизован
  it("should call next if user is authorized", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValue({ user_id: 123 });

    await authMiddleware(ctx as MyContext, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что сообщение отправляется, если пользователь не найден
  it("should send message if user is not found", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValue(null);

    await authMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.YOU_NOT_AUTH);
  });

  // Проверяет, что выполнение останавливается, если userId отсутствует
  it("should stop execution if userId is missing", async () => {
    (getUserId as jest.Mock).mockResolvedValue(null);

    await authMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что сообщение об ошибке отправляется и ошибка логируется
  it("should handle errors and send error message", async () => {
    const error = new Error("Some error");
    (getUserId as jest.Mock).mockRejectedValue(error);

    await authMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
    expect(logger.error).toHaveBeenCalledWith("Error authMiddleware:", error);
  });
});
