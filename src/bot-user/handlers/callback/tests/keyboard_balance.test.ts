import { MyContext } from "../../../types/type";
import { selectWithdrawalLogByUserId } from "../../../../database/queries/withdrawalLogsQueries";
import { getUserId } from "../../../utils/getUserId";
import { MESSAGES } from "../../../constants/messages";
import { handleBalance } from "../keyboard_balance";
import { BUTTONS_CALLBACK_QUERIES } from "../../../constants/button";
import {checkBalance} from "../../../../database/queries/userQueries";

jest.mock("../../../../database/queries/withdrawalLogsQueries");
jest.mock("../../../utils/getUserId");

describe("Test handleBalance", () => {
  let ctx: Partial<MyContext>;

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
  });

  // Должно показывать уведомление, если баланс вдруг не найден
  it("Should reply with error message if user balance not defined", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (checkBalance as jest.Mock).mockResolvedValue(null);

    await handleBalance(ctx as MyContext);

    // Проверяем, что сообщение отправлено с правильным текстом
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.USER_ID_UNDEFINED);
  });

  // Должна отправлять сообщение с нулевым балансом, если баланс равен 0
  it("Should reply with  message if user balance is 0", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (checkBalance as jest.Mock).mockResolvedValue({ balance: 0 });
    (selectWithdrawalLogByUserId as jest.Mock).mockResolvedValue([]);

    // Создаем mock контекст
    const ctx = {
      reply: jest.fn(), // Мокаем метод reply
    } as unknown as MyContext;

    // Вызываем функцию
    await handleBalance(ctx);

    // Проверяем, что сообщение отправлено с правильным текстом
    expect(ctx.reply).toHaveBeenCalledWith(
      `${MESSAGES.BALANCE} 0!\n\n${MESSAGES.BALANCE_HISTORY}\n`,
    );
  });

  // Должна отправлять сообщение с историей баланса и кнопкой, если баланс больше 0
  it("Should reply with  message with btn if user balance is more than 0", async () => {
    (getUserId as jest.Mock).mockResolvedValue(123);
    (checkBalance as jest.Mock).mockResolvedValue({ balance: 100 });
    (selectWithdrawalLogByUserId as jest.Mock).mockResolvedValue([
      { amount: 50, withdrawn_at: "1672531200000" },
    ]);

    await handleBalance(ctx as MyContext);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining(
        `${MESSAGES.BALANCE} 100!\n\n${MESSAGES.BALANCE_HISTORY}\n${"1111"}`,
      ),
      expect.objectContaining({
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButtonText,
                callback_data: BUTTONS_CALLBACK_QUERIES.WithdrawalOfMoneyButton,
              },
            ],
          ],
        },
      }),
    );
  });

  // Должна обрабатывать ошибки и отправлять сообщение об ошибке
  it("Should reply with error message if exception occurs.", async () => {
    // Настраиваем mock getUserId, чтобы выбрасывать ошибку
    (getUserId as jest.Mock).mockRejectedValue(new Error("Some error"));

    // Создаем mock контекст
    const ctx = {
      reply: jest.fn(), // Мокаем метод reply
    } as unknown as MyContext;

    // Вызываем функцию
    await handleBalance(ctx);

    // Проверяем, что сообщение об ошибке отправлено
    expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
  });
});
