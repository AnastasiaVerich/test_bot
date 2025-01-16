import { getUserId } from "../../utils/getUserId";
import { withdrawalScene } from "./withdrawalScene";
import {
  addPendingPayment,
  findPendingPaymentByUserId,
} from "../../../database/queries/pendingPaymentsQueries";
import { WITHDRAWAL_SCENE } from "../../constants/scenes";
import {
  checkBalance,
  updateUserBalance,
} from "../../../database/queries/balanceQueries";
import { MESSAGES } from "../../constants/messages";
import { AuthUserKeyboard } from "../../keyboards/AuthUserKeyboard";
import { BUTTONS_KEYBOARD } from "../../constants/button";
import logger from "../../../lib/logger";

jest.mock("../../utils/getUserId");
jest.mock("../../../database/queries/pendingPaymentsQueries");
jest.mock("../../../database/queries/balanceQueries");
jest.mock("../../../lib/logger");

const mockConversation = {
  waitFor: jest.fn(),
} as any;
const mockCtx = {
  reply: jest.fn(),
} as any;
describe("withdrawalScene", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should exit if userId is not defined", async () => {
    // Должен выйти, если userId не определен
    (getUserId as jest.Mock).mockResolvedValueOnce(null);

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).not.toHaveBeenCalled();
  });

  it("should notify user if they have a pending payment", async () => {
    // Должен уведомить пользователя, если у него есть ожидающий платеж
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([{}]);

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      WITHDRAWAL_SCENE.HAS_PENDING_PAYMENT,
    );
  });

  it("should notify user if balance is undefined", async () => {
    // Должен уведомить пользователя, если баланс не определен
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce(null);

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.USER_ID_UNDEFINED);
  });

  it("should notify user if balance is zero", async () => {
    // Должен уведомить пользователя, если баланс равен нулю
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce({ balance: 0 });

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      WITHDRAWAL_SCENE.INVALID_BALANCE,
    );
  });

  it("should notify user if amount is invalid", async () => {
    // Должен уведомить пользователя, если сумма для вывода некорректна
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce({ balance: 100 });

    mockConversation.waitFor.mockResolvedValueOnce({
      message: { text: "-50" },
    });

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      WITHDRAWAL_SCENE.INVALID_AMOUNT.replace("{balance}", "100"),
      { reply_markup: AuthUserKeyboard() },
    );
  });

  it("should notify user if address is invalid", async () => {
    // Должен уведомить пользователя, если адрес получателя некорректен
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce({ balance: 100 });

    mockConversation.waitFor
      .mockResolvedValueOnce({ message: { text: "50" } })
      .mockResolvedValueOnce({ message: { text: "" } });

    await withdrawalScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      WITHDRAWAL_SCENE.INVALID_ADDRESS,
    );
  });

  it("should add pending payment and update balance on confirmation", async () => {
    // Должен добавить ожидающий платеж и обновить баланс при подтверждении
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce({ balance: 100 });

    mockConversation.waitFor
      .mockResolvedValueOnce({ message: { text: "50" } })
      .mockResolvedValueOnce({ message: { text: "valid-address" } })
      .mockResolvedValueOnce({
        message: { text: BUTTONS_KEYBOARD.ConfirmButton },
      });

    await withdrawalScene(mockConversation, mockCtx);

    expect(addPendingPayment).toHaveBeenCalledWith(123, 50, "valid-address");
    expect(updateUserBalance).toHaveBeenCalledWith(50, 123);
    expect(mockCtx.reply).toHaveBeenCalledWith(WITHDRAWAL_SCENE.SUCCESS, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  it("should cancel withdrawal if user cancels", async () => {
    // Должен отменить вывод средств, если пользователь отменил
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findPendingPaymentByUserId as jest.Mock).mockResolvedValueOnce([]);
    (checkBalance as jest.Mock).mockResolvedValueOnce({ balance: 100 });

    mockConversation.waitFor
      .mockResolvedValueOnce({ message: { text: "50" } })
      .mockResolvedValueOnce({ message: { text: "valid-address" } })
      .mockResolvedValueOnce({
        message: { text: BUTTONS_KEYBOARD.CancelButton },
      });

    await withdrawalScene(mockConversation, mockCtx);

    expect(addPendingPayment).not.toHaveBeenCalled();
    expect(updateUserBalance).not.toHaveBeenCalled();
    expect(mockCtx.reply).toHaveBeenCalledWith(WITHDRAWAL_SCENE.CANCELLED, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  it("should handle errors and send an error message", async () => {
    // Должен обработать ошибки и отправить сообщение об ошибке
    (getUserId as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

    await withdrawalScene(mockConversation, mockCtx);

    expect(logger.error).toHaveBeenCalledWith(
      "Error in withdrawalScene: Test error",
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
  });
});
