import { handleStartCommand } from "./command_start";
import { MyContext } from "../../types/type";
import { MESSAGES } from "../../constants/messages";
import {
  findUserByTelegramId,
  User,
} from "../../../database/queries/userQueries";
import { addReferral } from "../../../database/queries/referralQueries";

jest.mock("../../../database/queries/userQueries");
jest.mock("../../../database/queries/referralQueries");

describe("Test handleStartCommand", () => {
  let ctx: Partial<MyContext>;
  let user: Partial<User>;

  beforeEach(() => {
    jest.clearAllMocks();

    ctx = {
      from: {
        id: 12345,
        is_bot: false,
        first_name: "User_test",
      },
      match: undefined,
      reply: jest.fn(),
    };
    user = {
      user_id: 1234,
    };
  });

  // Должна для нового юзера добавить реферальный код и отправить приветственное меню.
  it("New user with referral code: should add referral and show welcome menu.", async () => {
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce(undefined);
    (addReferral as jest.Mock).mockResolvedValueOnce({});

    ctx.match = "67890";

    await handleStartCommand(ctx as MyContext);

    expect(addReferral).toHaveBeenCalledWith(12345, 67890);
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.WELCOME_MENU_USER, {
      parse_mode: "HTML",
      reply_markup: expect.any(Object),
    });
  });

  // Должна для нового юзера отправить приветственное меню без добавления реферального кода
  it("New user without referral code: should show welcome menu.", async () => {
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce(undefined);

    await handleStartCommand(ctx as MyContext);

    expect(addReferral).not.toHaveBeenCalled();
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.WELCOME_MENU_USER, {
      parse_mode: "HTML",
      reply_markup: expect.any(Object),
    });
  });

  // Должна отправить меню для старого пользователя
  it("Existing user: should show welcome back menu.", async () => {
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce(user);

    await handleStartCommand(ctx as MyContext);

    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.WELCOME_OLD_USER, {
      reply_markup: expect.any(Object),
    });
  });

  // Должна обработать ошибку и отправить сообщение с текстом ошибки
  it("Should reply with error message if exception occurs.", async () => {
    const error = new Error("Database error");
    (findUserByTelegramId as jest.Mock).mockRejectedValueOnce(error);

    await handleStartCommand(ctx as MyContext);

    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR, {
      reply_markup: { remove_keyboard: true },
    });
  });
});
