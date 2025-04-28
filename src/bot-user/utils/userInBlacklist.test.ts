import { userInBlacklist } from "./userInBlacklist";
import { checkExistInBlockUser } from "../../database/queries/blacklistUsersQueries";
import {RESPONSES} from "../../bot-common/constants/responses";
import {MyContext} from "../../bot-common/types/type";

jest.mock("../../database/queries/blacklistUsersQueries");

describe("Test userInBlacklist", () => {
  let ctx: Partial<MyContext>;

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

  // При блокировке должно возвращать текст блокировки и true
  it("Should return false and message.", async () => {
    (checkExistInBlockUser as jest.Mock).mockResolvedValueOnce({
      account_id: 12345,
    });

    const res = await userInBlacklist(12345, null, ctx as MyContext);
    expect(res).toBe(true);
    expect(ctx.reply).toHaveBeenCalledWith(RESPONSES.YOU_IN_BLACKLIST, {
      reply_markup: { remove_keyboard: true },
    });
  });

  // Без блокировки не должна быть ошибка и возвращается false
  it("Should return true and no message", async () => {
    (checkExistInBlockUser as jest.Mock).mockResolvedValueOnce(undefined);

    const res = await userInBlacklist(12345, null, ctx as MyContext);
    expect(res).toBe(false);
    expect(ctx.reply).not.toHaveBeenCalled();
  });
});
