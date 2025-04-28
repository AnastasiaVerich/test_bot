/*
import { AuthUserKeyboard } from "../../../bot-user/keyboards/AuthUserKeyboard";
import { MESSAGES } from "../../constants/messages";
import { getUserId } from "../../utils/getUserId";
import logger from "../../../lib/logger";
import {REGISTRATION_SCENE} from "./text";
import {registrationSceneNew} from "./registration";

jest.mock("../../utils/getUserId");
jest.mock("../../../bot-user/keyboards/AuthUserKeyboard");
jest.mock("../../../lib/logger");

const mockConversation = {
  waitFor: jest.fn(),
} as any;

const mockCtx = {
  reply: jest.fn(),
} as any;

describe("registrationScene", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  //должен выйти, если userId не определен
  it("should exit if userId is not defined", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(null);

    await registrationSceneNew(mockConversation, mockCtx);

    expect(mockCtx.reply).not.toHaveBeenCalled();
  });

  //должен запросить номер телефона и обработать успешную регистрацию
  it("should request phone number and handle successful registration", async () => {
    const mockUserId = 123;
    const mockPhone = "+1234567890";
    (getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { contact: { phone_number: mockPhone } },
    });
    mockConversation.waitFor.mockResolvedValueOnce({
      message: {
        web_app_data: {
          data: JSON.stringify({ text: "success" }),
        },
      },
    });

    (AuthUserKeyboard as jest.Mock).mockReturnValueOnce("mock_keyboard");

    await registrationSceneNew(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      REGISTRATION_SCENE.ENTER_PHONE,
      expect.objectContaining({
        reply_markup: expect.any(Object),
      }),
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(
      REGISTRATION_SCENE.VERIFY_BY_PHOTO,
      expect.objectContaining({
        reply_markup: expect.any(Object),
      }),
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(REGISTRATION_SCENE.SUCCESS, {
      reply_markup: "mock_keyboard",
    });
  });

  //должен отправить сообщение, если пользователь уже существует
  it("should send a message if the user already exists", async () => {
    const mockUserId = 123;
    const mockPhone = "+1234567890";
    (getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { contact: { phone_number: mockPhone } },
    });
    mockConversation.waitFor.mockResolvedValueOnce({
      message: {
        web_app_data: {
          data: JSON.stringify({ text: "user_exist_number" }),
        },
      },
    });

    await registrationSceneNew(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(REGISTRATION_SCENE.USER_EXIST);
  });

  //должен отправить сообщение, если пользователь заблокирован
  it("should send a message if the user is blocked", async () => {
    const mockUserId = 123;
    const mockPhone = "+1234567890";
    (getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { contact: { phone_number: mockPhone } },
    });
    mockConversation.waitFor.mockResolvedValueOnce({
      message: {
        web_app_data: {
          data: JSON.stringify({ text: "user_is_block" }),
        },
      },
    });

    await registrationSceneNew(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      REGISTRATION_SCENE.USER_IN_BLOCK,
    );
  });

  //должен отправить сообщение об ошибке на неизвестный текст
  it("should send an error message for unknown text", async () => {
    const mockUserId = 123;
    const mockPhone = "+1234567890";
    (getUserId as jest.Mock).mockResolvedValueOnce(mockUserId);
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { contact: { phone_number: mockPhone } },
    });
    mockConversation.waitFor.mockResolvedValueOnce({
      message: {
        web_app_data: {
          data: JSON.stringify({ text: "unknown_text" }),
        },
      },
    });

    await registrationSceneNew(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(REGISTRATION_SCENE.FAILED);
  });

  //должен отправить сообщение об ошибке при исключении
  it("should send an error message on exception", async () => {
    const mockError = new Error("Test error");
    (getUserId as jest.Mock).mockRejectedValueOnce(mockError);

    await registrationSceneNew(mockConversation, mockCtx);

    expect(logger.error).toHaveBeenCalledWith(
      "Error in registrationScene: Test error",
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
  });
});
*/
