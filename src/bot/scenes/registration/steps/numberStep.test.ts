import { Conversation } from "@grammyjs/conversations";
// Путь к вашей функции
import { MyContext } from "../../../types/type";
import { numberStep } from "./numberStep";
import { REGISTRATION_SCENE } from "../../../constants/scenes";

describe("Test numberStep", () => {
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
      message: { contact: { phone_number: "1234567" } },
    };
    (conversation.waitFor as jest.Mock).mockResolvedValue(webAppData);

    const result = await numberStep(
      conversation as Conversation<MyContext>,
      ctx as MyContext,
    );

    // Проверяем, что был вызван метод reply с правильным текстом и кнопкой

    expect(ctx.reply).toHaveBeenCalledWith(REGISTRATION_SCENE.INPUT_PHONE, {
      parse_mode: "HTML",
      reply_markup: expect.any(Object),
    });

    // Проверяем, что вернулось правильное состояние
    expect(result).toBe("1234567");
  });
});
