import logger from "../../../lib/logger";
import { userInBlacklist } from "../../utils/userInBlacklist";
import { blacklistMiddleware } from "../blacklistMiddleware";
import { RESPONSES } from "../../../bot-common/constants/responses";
import { MyContext } from "../../../bot-common/types/type";
import { getUserId } from "../../../bot-common/utils/getUserId";

jest.mock("../../utils/userInBlacklist");
jest.mock("../../utils/getUserId");
jest.mock("../../../lib/logger");

describe("Test blacklistMiddleware", () => {
  let ctx: Partial<MyContext>;
  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    ctx = {
      reply: jest.fn(),
    };
  });

  // Проверяет, что next вызывается, если пользователь не заблокирован
  it("Should call next if user is not in blacklist", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (userInBlacklist as jest.Mock).mockResolvedValue(false);

    await blacklistMiddleware(ctx as MyContext, next);

    expect(next).toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что выполнение останавливается, если пользователь заблокирован
  it("Should stop execution if user in blacklist", async () => {
    (getUserId as jest.Mock).mockResolvedValue(null);
    (userInBlacklist as jest.Mock).mockResolvedValue(true);

    await blacklistMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что выполнение останавливается, если userId отсутствует
  it("Should stop execution if userId is missing", async () => {
    (getUserId as jest.Mock).mockResolvedValue(null);

    await blacklistMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).not.toHaveBeenCalled();
  });

  // Проверяет, что сообщение об ошибке отправляется и ошибка логируется
  it("Should handle errors and send error message", async () => {
    const error_text = "Some error";
    const error = new Error(error_text);
    (getUserId as jest.Mock).mockRejectedValue(error);

    await blacklistMiddleware(ctx as MyContext, next);

    expect(next).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(RESPONSES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });

    expect(logger.error).toHaveBeenCalledWith(
      "Error blacklistMiddleware: " + error_text,
    );
  });
});
