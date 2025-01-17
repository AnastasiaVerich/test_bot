import { MESSAGES } from "../constants/messages";
import { MyContext } from "../types/type";
import { getUserId } from "./getUserId";

describe("getUserId", () => {
  let ctx: Partial<MyContext>;

  describe("when user ID exists", () => {
    beforeEach(() => {
      ctx = {
        from: {
          id: 12345,
          is_bot: false,
          first_name: "User_test",
        },
        reply: jest.fn(),
      };
    });
    // Проверить корректное возрващение id
    it("Should return user ID if it exists.", async () => {
      const userId = await getUserId(ctx as MyContext);
      expect(userId).toBe(12345);
    });
  });
  describe("when user ID is undefined", () => {
    beforeEach(() => {
      ctx = {
        from: undefined,
        reply: jest.fn(),
      };
    });
    // Должно возвращать ошибку, если id не найден
    it("should reply with error message if user ID is undefined", async () => {
      const userId = await getUserId(ctx as MyContext);

      expect(ctx.reply).toHaveBeenCalledWith(MESSAGES.USER_ID_UNDEFINED);
      expect(userId).toBeNull();
    });
  });
});
