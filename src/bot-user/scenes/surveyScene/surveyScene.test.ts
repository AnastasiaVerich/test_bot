import { surveyScene } from "./surveyScene";
import { AuthUserKeyboard } from "../../../bot-user/keyboards/AuthUserKeyboard";
import { SURVEY_SCENE } from "../../constants/scenes";
import { MESSAGES } from "../../constants/messages";
import { getUserId } from "../../utils/getUserId";
import { findUserByTelegramId } from "../../../database/queries/userQueries";
import { findRegionByLocation } from "../../../utils/regionUtils";
import { findAvailableSurvey } from "../../../database/queries/surveyQueries";
import { getOperatorsByRegionAndStatus } from "../../../database/queries/operatorQueries";
import logger from "../../../lib/logger";

jest.mock("../../utils/getUserId");
jest.mock("../../../database/queries/userQueries");
jest.mock("../../../utils/regionUtils");
jest.mock("../../../database/queries/surveyQueries");
jest.mock("../../../database/queries/operatorQueries");
jest.mock("../../../lib/logger");

const mockConversation = {
  waitFor: jest.fn(),
} as any;

const mockCtx = {
  reply: jest.fn(),
  conversation: {
    enter: jest.fn(),
  },
} as any;

describe("surveyScene", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Должен выйти, если userId не определен
  it("should exit if userId is not defined", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(null);

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).not.toHaveBeenCalled();
  });

  // Должен перенаправить пользователя на идентификацию, если last_init старше 7 дней
  it("should redirect user to initialization if last_init is older than 7 days", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      last_init: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    });

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.conversation.enter).toHaveBeenCalledWith(
      "IdentificationScene",
    );
  });

  // Должен уведомить пользователя, если он занят
  it("should notify the user if they are busy", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      status: "busy",
      last_init: new Date().toISOString(),
    });

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(SURVEY_SCENE.USER_BUSY, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  // Должен запросить локацию и обработать некорректные данные
  it("should request location and handle invalid location", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      status: "free",
      last_init: new Date().toISOString(),
    });

    mockConversation.waitFor.mockResolvedValueOnce({
      message: { location: { latitude: null, longitude: null } },
    });

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(SURVEY_SCENE.LOCATION_FAILED, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  // Должен уведомить пользователя, если регион не найден
  it("should notify the user if no region is found", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      status: "free",
      last_init: new Date().toISOString(),
    });

    mockConversation.waitFor.mockResolvedValueOnce({
      message: { location: { latitude: 50.0, longitude: 40.0 } },
    });

    (findRegionByLocation as jest.Mock).mockResolvedValueOnce(null);

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(SURVEY_SCENE.REGION_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  // Должен уведомить пользователя, если опрос не найден
  it("should notify the user if no survey is found", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      status: "free",
      last_init: new Date().toISOString(),
    });

    const mockRegion = { region_id: 1 };
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { location: { latitude: 50.0, longitude: 40.0 } },
    });

    (findRegionByLocation as jest.Mock).mockResolvedValueOnce(mockRegion);
    (findAvailableSurvey as jest.Mock).mockResolvedValueOnce(null);

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(SURVEY_SCENE.SURVEY_NOT_FOUND, {
      reply_markup: AuthUserKeyboard(),
    });
  });

  // Должен уведомить пользователя, если оператор не найден
  it("should notify the user if no operator is found", async () => {
    (getUserId as jest.Mock).mockResolvedValueOnce(123);
    (findUserByTelegramId as jest.Mock).mockResolvedValueOnce({
      status: "free",
      last_init: new Date().toISOString(),
    });

    const mockRegion = { region_id: 1 };
    const mockSurvey = { survey_id: 1 };
    mockConversation.waitFor.mockResolvedValueOnce({
      message: { location: { latitude: 50.0, longitude: 40.0 } },
    });

    (findRegionByLocation as jest.Mock).mockResolvedValueOnce(mockRegion);
    (findAvailableSurvey as jest.Mock).mockResolvedValueOnce(mockSurvey);
    (getOperatorsByRegionAndStatus as jest.Mock).mockResolvedValueOnce([]);

    await surveyScene(mockConversation, mockCtx);

    expect(mockCtx.reply).toHaveBeenCalledWith(
      SURVEY_SCENE.OPERATOR_NOT_FOUND,
      {
        reply_markup: AuthUserKeyboard(),
      },
    );
  });

  // Должен обработать ошибки и отправить сообщение об ошибке
  it("should handle errors and send an error message", async () => {
    (getUserId as jest.Mock).mockRejectedValueOnce(new Error("Test error"));

    await surveyScene(mockConversation, mockCtx);

    expect(logger.error).toHaveBeenCalledWith(
      "Error in surveyScene: Test error",
    );
    expect(mockCtx.reply).toHaveBeenCalledWith(MESSAGES.SOME_ERROR);
  });
});
