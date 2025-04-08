import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../../types/type";

import { SURVEY_SCENE } from "../../../constants/scenes";
import { findRegionByLocation } from "../../../../utils/regionUtils";
import { regionState } from "./regionState";

// Мокаем зависимости
jest.mock("../../../../utils/regionUtils");

describe("Test regionState", () => {
  let ctx: Partial<MyContext>;
  const conversation: Partial<Conversation<MyContext>> = {
    waitFor: jest.fn(),
  };
  const nowDateTime = new Date();

  const tenDaysForward = new Date(nowDateTime);
  const oneDaysAgo = new Date(nowDateTime);

  tenDaysForward.setDate(nowDateTime.getDate() + 10);
  oneDaysAgo.setDate(nowDateTime.getDate() - 1);

  beforeEach(() => {
    ctx = {
      from: {
        id: 12345,
        is_bot: false,
        first_name: "User_test",
      },
      reply: jest.fn(),
      conversation: {
        enter: jest.fn(),
      } as unknown as MyContext["conversation"],
    };
  });

  // Должен запросить локацию, найти регион и вернуть его
  it("Should get location and get region", async () => {
    (findRegionByLocation as jest.Mock).mockResolvedValue({ region_id: 1 });

    const webAppData = {
      message: { location: { latitude: 1, longitude: 2 } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await regionState(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    expect(ctx.reply).toHaveBeenCalledWith(
      SURVEY_SCENE.INPUT_LOCATION,
      expect.objectContaining({
        reply_markup: expect.any(Object),
      }),
    );

    // Проверяем, что вернулось правильное состояние
    expect(result).toStrictEqual({ region_id: 1 });
  });

  // Должен вернуть null если локаия не найденна
  it("Should get null if location undefined", async () => {
    const webAppData = {
      message: { location: undefined },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await regionState(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    // Проверяем, что вернулось правильное состояние
    expect(result).toBe(null);
  });

  // Должен вернуть null если регион не найден
  it("Should get null if region undefined", async () => {
    (findRegionByLocation as jest.Mock).mockResolvedValue(null);

    const webAppData = {
      message: { location: { latitude: 1, longitude: 2 } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await regionState(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    // Проверяем, что вернулось правильное состояние
    expect(result).toBe(null);
  });
});
