import { errorMiddleware } from "../../../bot-common/middleware/errorMiddleware";
import logger from "../../../lib/logger";
import { MyContext } from "../../../bot-common/types/type";

jest.mock("../../../lib/logger");

describe("Test errorMiddleware", () => {
  let ctx: Partial<MyContext>;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      reply: jest.fn(),
    };
  });

  // Проверка, что next вызывается без ошибок
  it("should call next if no error occurs", async () => {
    await errorMiddleware(ctx as MyContext, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверка, что логируется ошибка, если она возникает
  it("should log the error and send a message if an error occurs", async () => {
    const error_text = "Test error";
    const error = new Error(error_text);

    next.mockRejectedValueOnce(error);

    await errorMiddleware(ctx as MyContext, next);

    expect(logger.error).toHaveBeenCalledWith(
      "Произошла ошибка: " + error_text,
    );
    expect(ctx.reply).toHaveBeenCalledWith(
      "Произошла ошибка. Пожалуйста, попробуйте позже.",
    );
  });
});
