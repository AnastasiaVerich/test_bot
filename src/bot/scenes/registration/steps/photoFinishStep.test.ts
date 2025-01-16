import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../../../types/type";
import { REGISTRATION_SCENE } from "../../../constants/scenes";
import { photoFinishStep } from "./photoFinishStep";

describe("Test photoFinishStep", () => {
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

  // Проверяет, что шаг правильно работает
  it("Should work like it", async () => {
    const webAppData = {
      message: { web_app_data: { data: '{"text": "some"}' } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await photoFinishStep(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
      "123",
      123,
    );

    // Проверяем, что был вызван метод reply с правильным текстом и кнопкой

    expect(ctx.reply).toHaveBeenCalledWith(REGISTRATION_SCENE.VERIFY_BY_PHOTO, {
      reply_markup: expect.any(Object),
    });

    // Проверяем, что вернулось правильное состояние
    expect(result).toBe("some");
  });
});
